"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mic, X, Loader2 } from "lucide-react";

type PyraState = "idle" | "listening" | "processing" | "responding";

interface AIResponse {
  response: string;
  suggestions?: string[];
  actions?: Record<string, string>;
}

export default function PyraVoiceAssistant() {
  const router = useRouter();
  const [state, setState] = useState<PyraState>("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");

  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<any>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  // Check browser support once
  const isSupported =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  // ── Send to existing AI chatbot ──────────────────────────────────────
  const sendToAI = useCallback(async (text: string) => {
    setState("processing");
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyRef.current.slice(-6),
        }),
      });
      const data: AIResponse = await res.json();
      historyRef.current.push(
        { role: "user", content: text },
        { role: "assistant", content: data.response }
      );
      setAiResponse(data);
      setState("responding");
    } catch {
      setError("Something went wrong. Try again.");
      setState("responding");
    }
  }, []);

  // ── Start listening ──────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "ar-EG";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let final = "";

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript + " ";
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      setTranscript((final + interim).trim());

      // Reset silence timer
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => recognition.stop(), 2500);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      const cmd = final.trim();
      if (cmd) {
        sendToAI(cmd);
      } else {
        setState("idle");
      }
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setState("idle");
    };

    recognitionRef.current = recognition;
    setState("listening");
    setTranscript("");
    setAiResponse(null);
    setError("");
    recognition.start();
  }, [isSupported, sendToAI]);

  // ── Dismiss ──────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    setState("idle");
    setTranscript("");
    setAiResponse(null);
    setError("");
  }, []);

  // ── Navigate from action button ──────────────────────────────────────
  const handleAction = useCallback(
    (url: string) => {
      dismiss();
      router.push(url);
    },
    [dismiss, router]
  );

  // ── Cleanup ──────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch {}
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, []);

  if (!isSupported) return null;

  const isOpen = state !== "idle";

  return (
    <>
      {/* ── Floating mic button (only visible when idle) ────────────── */}
      {!isOpen && (
        <button
          onClick={startListening}
          className="fixed z-[200] flex items-center justify-center h-12 w-12 rounded-full shadow-lg shadow-purple-900/20 transition-all hover:scale-110 active:scale-95"
          style={{
            left: "max(16px, calc(env(safe-area-inset-left) + 16px))",
            bottom: "max(36px, calc(env(safe-area-inset-bottom) + 28px))",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          }}
          aria-label="Activate Pyra voice assistant"
        >
          <Mic className="h-5 w-5 text-white" />
        </button>
      )}

      {/* ── Full-screen overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.93), rgba(0,0,0,0.98))",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-6 right-6 p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* ── Orb ────────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-center mb-10">
              {/* Outer glow */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 180,
                  height: 180,
                  background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
                }}
                animate={
                  state === "listening"
                    ? { scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }
                    : { scale: 1, opacity: 0.15 }
                }
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Inner glow */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
                }}
                animate={
                  state === "listening"
                    ? { scale: [1, 1.35, 1], opacity: [0.3, 0.6, 0.3] }
                    : { scale: 1, opacity: 0.2 }
                }
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              />

              {/* Core */}
              <motion.div
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: 90,
                  height: 90,
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
                  boxShadow: "0 0 50px rgba(168,85,247,0.35), 0 0 100px rgba(168,85,247,0.15)",
                }}
                animate={
                  state === "listening"
                    ? { scale: [1, 1.06, 1] }
                    : state === "processing"
                    ? { rotate: 360 }
                    : { scale: 1 }
                }
                transition={
                  state === "processing"
                    ? { duration: 1.5, repeat: Infinity, ease: "linear" }
                    : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                {state === "processing" ? (
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                ) : (
                  <Mic className="h-7 w-7 text-white" />
                )}
              </motion.div>
            </div>

            {/* ── Content ────────────────────────────────────────────── */}
            <div className="text-center max-w-md w-full">
              {state === "listening" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm text-purple-300/70 mb-3">Listening…</p>
                  {transcript && (
                    <p className="text-lg text-white font-medium leading-relaxed" dir="auto">
                      {transcript}
                    </p>
                  )}
                </motion.div>
              )}

              {state === "processing" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {transcript && (
                    <p className="text-sm text-white/40 mb-2" dir="auto">{transcript}</p>
                  )}
                  <p className="text-sm text-purple-300/70">Thinking…</p>
                </motion.div>
              )}

              {state === "responding" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {error ? (
                    <p className="text-sm text-red-400">{error}</p>
                  ) : aiResponse && (
                    <div className="text-left">
                      <p
                        className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap max-h-[45vh] overflow-y-auto scrollbar-thin"
                        dir="auto"
                      >
                        {aiResponse.response}
                      </p>

                      {/* Action buttons */}
                      {aiResponse.actions && Object.keys(aiResponse.actions).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {Object.entries(aiResponse.actions).map(([label, url]) => (
                            <button
                              key={label}
                              onClick={() => handleAction(url)}
                              className="px-4 py-2 rounded-full bg-purple-600/25 border border-purple-500/30 text-purple-200 text-xs font-medium hover:bg-purple-600/40 transition-all"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {aiResponse.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setTranscript(s);
                                sendToAI(s);
                              }}
                              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[11px] hover:bg-white/10 hover:text-white/80 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ask again */}
                  <button
                    onClick={startListening}
                    className="mt-6 mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 hover:text-white/70 transition-all"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Ask again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
