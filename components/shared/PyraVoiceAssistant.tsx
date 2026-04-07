"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mic, MicOff, X, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PyraState = "sleeping" | "wakeup" | "listening" | "processing" | "responding";

interface AIResponse {
  response: string;
  suggestions?: string[];
  actions?: Record<string, string>;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const WAKE_WORDS = ["pyra", "بيرا", "بايرا", "pierra", "pira", "بيره"];

// ─── Component ───────────────────────────────────────────────────────────────
export default function PyraVoiceAssistant() {
  const router = useRouter();

  // State
  const [pyraState, setPyraState] = useState<PyraState>("sleeping");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs
  const wakeRecognitionRef = useRef<any>(null);
  const commandRecognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  // ─── Check browser support ──────────────────────────────────────────────
  const getSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return SpeechRecognition || null;
  }, []);

  // ─── Send command to existing AI chatbot API ────────────────────────────
  const sendToAI = useCallback(async (message: string) => {
    setPyraState("processing");
    setError("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.current.slice(-6),
        }),
      });

      const data: AIResponse = await res.json();

      // Update conversation history
      conversationHistory.current.push(
        { role: "user", content: message },
        { role: "assistant", content: data.response }
      );

      setAiResponse(data);
      setPyraState("responding");
    } catch (err) {
      setError("عذراً، حدث خطأ. حاول مرة أخرى.");
      setPyraState("responding");
    }
  }, []);

  // ─── Start listening for the actual command ─────────────────────────────
  const startCommandListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    // Stop wake listener while taking command
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      setTranscript((finalTranscript + interim).trim());

      // Reset silence timer on every result
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        // 2 seconds of silence after speech → process
        recognition.stop();
      }, 2000);
    };

    recognition.onend = () => {
      commandRecognitionRef.current = null;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      const command = finalTranscript.trim();
      if (command.length > 0) {
        sendToAI(command);
      } else {
        // No speech detected, go back to sleeping
        setPyraState("sleeping");
        startWakeWordListener();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Command recognition error:", event.error);
      if (event.error === "no-speech") {
        setPyraState("sleeping");
        startWakeWordListener();
      }
    };

    commandRecognitionRef.current = recognition;
    setPyraState("listening");
    setTranscript("");
    setAiResponse(null);

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start command recognition:", err);
    }
  }, [getSpeechRecognition, sendToAI]);

  // ─── Start wake word listener (passive, continuous) ─────────────────────
  const startWakeWordListener = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    // Don't start if already running
    if (wakeRecognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Check all alternatives for the wake word
        for (let j = 0; j < event.results[i].length; j++) {
          const t = event.results[i][j].transcript.toLowerCase().trim();
          const detectedWake = WAKE_WORDS.some(
            (w) => t.includes(w) || t.startsWith(w)
          );
          if (detectedWake) {
            // Wake word detected!
            recognition.abort();
            wakeRecognitionRef.current = null;
            setPyraState("wakeup");

            // Brief visual flash, then start listening
            setTimeout(() => {
              startCommandListening();
            }, 500);
            return;
          }
        }
      }
    };

    recognition.onend = () => {
      wakeRecognitionRef.current = null;
      // Auto-restart if still enabled and in sleeping state
      if (isEnabled && pyraState === "sleeping") {
        setTimeout(() => {
          startWakeWordListener();
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      wakeRecognitionRef.current = null;
      if (event.error === "not-allowed") {
        setPermissionGranted(false);
        setIsEnabled(false);
        return;
      }
      // Auto-restart on transient errors
      if (isEnabled) {
        setTimeout(() => {
          startWakeWordListener();
        }, 1000);
      }
    };

    wakeRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      wakeRecognitionRef.current = null;
    }
  }, [getSpeechRecognition, isEnabled, pyraState, startCommandListening]);

  // ─── Enable/Disable Pyra ───────────────────────────────────────────────
  const enablePyra = useCallback(async () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Voice not supported in this browser");
      return;
    }

    // Request mic permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      setIsEnabled(true);
      setPyraState("sleeping");
      localStorage.setItem("pyra-voice-enabled", "true");
    } catch {
      setError("Microphone permission denied");
      setPermissionGranted(false);
    }
  }, [getSpeechRecognition]);

  const disablePyra = useCallback(() => {
    setIsEnabled(false);
    setPyraState("sleeping");
    localStorage.removeItem("pyra-voice-enabled");

    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch {}
      wakeRecognitionRef.current = null;
    }
    if (commandRecognitionRef.current) {
      try { commandRecognitionRef.current.abort(); } catch {}
      commandRecognitionRef.current = null;
    }
  }, []);

  // ─── Dismiss overlay ──────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (commandRecognitionRef.current) {
      try { commandRecognitionRef.current.abort(); } catch {}
      commandRecognitionRef.current = null;
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setPyraState("sleeping");
    setTranscript("");
    setAiResponse(null);
    setError("");

    // Restart wake listener
    setTimeout(() => {
      startWakeWordListener();
    }, 500);
  }, [startWakeWordListener]);

  // ─── Handle action navigation ──────────────────────────────────────────
  const handleAction = useCallback(
    (url: string) => {
      dismiss();
      router.push(url);
    },
    [dismiss, router]
  );

  // ─── Auto-start on mount if previously enabled ─────────────────────────
  useEffect(() => {
    const wasEnabled = localStorage.getItem("pyra-voice-enabled") === "true";
    if (wasEnabled && getSpeechRecognition()) {
      // Check if permission is still granted
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          setPermissionGranted(true);
          setIsEnabled(true);
          setPyraState("sleeping");
        })
        .catch(() => {
          localStorage.removeItem("pyra-voice-enabled");
        });
    }
  }, [getSpeechRecognition]);

  // ─── Start/stop wake listener when enabled state changes ───────────────
  useEffect(() => {
    if (isEnabled && permissionGranted && pyraState === "sleeping") {
      startWakeWordListener();
    }

    return () => {
      if (wakeRecognitionRef.current) {
        try { wakeRecognitionRef.current.abort(); } catch {}
        wakeRecognitionRef.current = null;
      }
    };
  }, [isEnabled, permissionGranted, pyraState, startWakeWordListener]);

  // ─── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (wakeRecognitionRef.current) {
        try { wakeRecognitionRef.current.abort(); } catch {}
      }
      if (commandRecognitionRef.current) {
        try { commandRecognitionRef.current.abort(); } catch {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // ─── Don't render anything if Speech API not supported ─────────────────
  if (!getSpeechRecognition()) return null;

  const isOverlayVisible = pyraState !== "sleeping";

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Enable/Disable Toggle — small pill in bottom-left */}
      {!isEnabled && (
        <button
          onClick={enablePyra}
          className="fixed z-[200] left-4 bottom-4 md:left-6 md:bottom-8 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium backdrop-blur-xl hover:bg-white/20 hover:text-white transition-all shadow-lg"
          style={{
            left: "max(16px, calc(env(safe-area-inset-left) + 16px))",
            bottom: "max(36px, calc(env(safe-area-inset-bottom) + 28px))",
          }}
          aria-label="Enable Pyra voice assistant"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Enable Pyra</span>
        </button>
      )}

      {/* Passive listening indicator — tiny dot when wake-word listener is active */}
      {isEnabled && pyraState === "sleeping" && (
        <div
          className="fixed z-[200] left-4 bottom-4 md:left-6 md:bottom-8 flex items-center gap-2"
          style={{
            left: "max(16px, calc(env(safe-area-inset-left) + 16px))",
            bottom: "max(36px, calc(env(safe-area-inset-bottom) + 28px))",
          }}
        >
          <button
            onClick={disablePyra}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-medium backdrop-blur-xl hover:bg-white/10 hover:text-white/60 transition-all"
            aria-label="Disable Pyra voice assistant"
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span>Say &quot;Pyra&quot;</span>
            <MicOff className="h-3 w-3 ml-1 opacity-60" />
          </button>
        </div>
      )}

      {/* ─── Full-screen Overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.97) 100%)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-6 right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close Pyra"
            >
              <X className="h-6 w-6" />
            </button>

            {/* ─── Animated Orb ─────────────────────────────────────────── */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Outer glow rings */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 200,
                  height: 200,
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
                }}
                animate={
                  pyraState === "listening"
                    ? { scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }
                    : pyraState === "processing"
                    ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }
                    : { scale: 1, opacity: 0.2 }
                }
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
                }}
                animate={
                  pyraState === "listening"
                    ? { scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }
                    : { scale: 1, opacity: 0.3 }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />

              {/* Core orb */}
              <motion.div
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: 100,
                  height: 100,
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #c084fc 70%, #7c3aed 100%)",
                  boxShadow: "0 0 60px rgba(168,85,247,0.4), 0 0 120px rgba(168,85,247,0.2)",
                }}
                animate={
                  pyraState === "listening"
                    ? { scale: [1, 1.08, 1] }
                    : pyraState === "processing"
                    ? { rotate: [0, 360] }
                    : pyraState === "wakeup"
                    ? { scale: [0.8, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={
                  pyraState === "processing"
                    ? { duration: 2, repeat: Infinity, ease: "linear" }
                    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }
              >
                {pyraState === "processing" ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </motion.div>
            </div>

            {/* ─── Status Text ─────────────────────────────────────────── */}
            <motion.div
              className="text-center px-6 max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {pyraState === "wakeup" && (
                <p className="text-xl font-semibold text-white mb-2">Pyra</p>
              )}

              {pyraState === "listening" && (
                <>
                  <p className="text-sm text-purple-300/80 mb-3">Listening…</p>
                  {transcript && (
                    <motion.p
                      className="text-lg text-white font-medium leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      dir="auto"
                    >
                      {transcript}
                    </motion.p>
                  )}
                </>
              )}

              {pyraState === "processing" && (
                <>
                  {transcript && (
                    <p className="text-sm text-white/50 mb-2 line-through" dir="auto">
                      {transcript}
                    </p>
                  )}
                  <p className="text-sm text-purple-300/80">Thinking…</p>
                </>
              )}

              {pyraState === "responding" && (
                <>
                  {error ? (
                    <p className="text-sm text-red-400">{error}</p>
                  ) : (
                    aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                      >
                        <p
                          className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto"
                          dir="auto"
                        >
                          {aiResponse.response}
                        </p>

                        {/* Action buttons */}
                        {aiResponse.actions &&
                          Object.keys(aiResponse.actions).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {Object.entries(aiResponse.actions).map(
                                ([label, url]) => (
                                  <button
                                    key={label}
                                    onClick={() => handleAction(url)}
                                    className="px-4 py-2 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium hover:bg-purple-600/50 transition-all"
                                  >
                                    {label}
                                  </button>
                                )
                              )}
                            </div>
                          )}

                        {/* Suggestions */}
                        {aiResponse.suggestions &&
                          aiResponse.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {aiResponse.suggestions.map((s, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setTranscript(s);
                                    sendToAI(s);
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] hover:bg-white/10 hover:text-white transition-all"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                      </motion.div>
                    )
                  )}

                  {/* Tap to ask again */}
                  <button
                    onClick={() => startCommandListening()}
                    className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Tap to ask again</span>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
