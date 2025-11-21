"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Minimize2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
  actions?: Record<string, string>;
}

export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your PyraRide AI assistant powered by advanced AI. I can help you with bookings, finding stables, managing your account, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
      suggestions: ["Show me stables", "How do I book?", "What are the prices?"]
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // @ts-expect-error - Safari fallback
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if ("removeEventListener" in mediaQuery) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // @ts-expect-error - Safari fallback
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add("ai-chat-open");
    } else {
      document.body.classList.remove("ai-chat-open");
    }
    return () => {
      document.body.classList.remove("ai-chat-open");
    };
  }, [isMobile, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
        suggestions: data.suggestions || [],
        actions: data.actions || {},
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInput(actionText);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const launcherButton = (
    <Button
      onClick={() => setIsOpen(true)}
      className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/25 hover:scale-105 transition-all hover:shadow-xl border-2 border-white/20"
      size="icon"
      aria-label="Open PyraRide AI assistant"
    >
      <MessageCircle className="h-6 w-6" />
      <motion.div
        className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 shadow-sm"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </Button>
  );

  return (
    <>
      {!isOpen && <div className="ai-launcher">{launcherButton}</div>}
      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && (
              <div
                className="ai-chat__backdrop"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 400 }}
              className={`ai-chat ${isMobile ? "ai-chat--mobile" : "ai-chat--desktop"}`}
            >
              <Card
                className={`flex flex-col shadow-2xl border-primary/50 bg-gradient-to-b from-background to-primary/5 ${
                  isMobile ? "ai-chat__panel--mobile" : "h-[650px] w-[420px]"
                }`}
              >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    PyraRide AI
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">AI</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Powered by advanced AI
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2 max-w-[80%]">
                        <div
                          className={`rounded-lg px-4 py-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                              : "bg-muted text-foreground border border-border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Quick Action Buttons */}
                        {message.role === "assistant" && message.actions && Object.keys(message.actions).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(message.actions).map(([label, url]) => (
                              <Link key={label} href={url}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                >
                                  {label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20">
                          <span className="text-xs font-medium">U</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                      <div className="rounded-lg bg-muted px-4 py-3 border border-border">
                        <div className="flex gap-2">
                          <motion.span
                            className="h-2 w-2 rounded-full bg-primary"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <motion.span
                            className="h-2 w-2 rounded-full bg-primary"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.span
                            className="h-2 w-2 rounded-full bg-primary"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-4 bg-background/50 backdrop-blur-sm">
                  {/* Suggestions */}
                  {messages[messages.length - 1]?.suggestions && messages[messages.length - 1].suggestions!.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {messages[messages.length - 1].suggestions!.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(suggestion)}
                          className="text-xs h-7 rounded-full border-primary/30 hover:bg-primary/10"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about PyraRide..."
                      disabled={isLoading}
                      className="rounded-full"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Powered by AI • Ask anything about bookings, stables, or pricing
                  </p>
                </div>
              </>
            )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
