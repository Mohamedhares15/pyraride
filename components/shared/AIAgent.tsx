"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, X, Minimize2, Loader2, Sparkles,
  Users, Bot, Search, ArrowLeft, Check, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
  actions?: Record<string, string>;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  isOwn: boolean;
  sender: {
    id: string;
    fullName: string;
    profilePhoto?: string;
  };
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profilePhoto?: string;
    role: string;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
    read: boolean;
  } | null;
  updatedAt: string;
}

interface Friend {
  id: string;
  friendId: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
}

type ChatMode = "bot" | "messages" | "conversation";

export default function AIAgent() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("bot");

  // Bot state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your PyraRide AI assistant. I can help you with bookings, finding stables, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
      suggestions: ["Show me stables", "How do I book?", "What are the prices?"]
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMessages]);

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

  // Fetch conversations and friends when switching to messages mode
  useEffect(() => {
    if (chatMode === "messages" && session?.user) {
      fetchConversations();
      fetchFriends();
    }
  }, [chatMode, session]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchChatMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setChatMode("conversation");
    await fetchChatMessages(conv.id);
  };

  const startConversationWithFriend = async (friendId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: friendId }),
      });
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversation;
        // Create a conversation object for the UI
        const friend = friends.find(f => f.friendId === friendId);
        setActiveConversation({
          id: conv.id,
          otherUser: friend ? {
            id: friend.friendId,
            fullName: friend.fullName,
            profilePhoto: friend.profilePhoto,
            role: "rider",
          } : null,
          lastMessage: null,
          updatedAt: new Date().toISOString(),
        });
        setChatMode("conversation");
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!input.trim() || !activeConversation) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      isOwn: true,
      sender: {
        id: session?.user?.id || "",
        fullName: session?.user?.name || "You",
      },
    };

    setChatMessages(prev => [...prev, tempMessage]);
    const messageContent = input.trim();
    setInput("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: messageContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? data.message : m)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: conversationHistory,
        }),
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
      if (chatMode === "conversation") {
        sendChatMessage();
      } else {
        handleSend();
      }
    }
  };

  const filteredFriends = friends.filter(f =>
    f.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const launcherButton = (
    <Button
      onClick={() => setIsOpen(true)}
      className="h-14 w-14 rounded-full bg-white/20 shadow-lg shadow-black/20 hover:bg-white/35 hover:scale-105 transition-all hover:shadow-2xl border border-white/50"
      size="icon"
      aria-label="Open PyraRide assistant"
      style={{
        backdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(1.1)',
      }}
    >
      <MessageCircle className="h-6 w-6 text-primary drop-shadow-sm" />
      <motion.div
        className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 shadow-md border border-white/30"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </Button>
  );

  // Render conversation view
  const renderConversation = () => (
    <>
      {/* Conversation Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setChatMode("messages");
            setActiveConversation(null);
          }}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center overflow-hidden">
            {activeConversation?.otherUser?.profilePhoto ? (
              <img src={activeConversation.otherUser.profilePhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold">
                {activeConversation?.otherUser?.fullName?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{activeConversation?.otherUser?.fullName || "Chat"}</h3>
            <p className="text-xs text-white/50">Tap to view profile</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.isOwn
                ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                : "bg-white/10 text-white"
                }`}>
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-60">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.isOwn && (
                    msg.read ? <CheckCheck className="h-3 w-3 text-blue-400" /> : <Check className="h-3 w-3 opacity-60" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 bg-black/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="rounded-full bg-white/10 border-white/20"
          />
          <Button
            onClick={sendChatMessage}
            disabled={!input.trim()}
            size="icon"
            className="rounded-full bg-gradient-to-r from-primary to-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  // Render messages list view
  const renderMessagesList = () => (
    <>
      {/* Messages Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Messages</h3>
            <p className="text-xs text-muted-foreground">Chat with friends</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setChatMode("bot")}
          className="flex-1 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <Bot className="h-4 w-4" />
          AI Bot
        </button>
        <button
          className="flex-1 py-3 text-sm font-medium text-white bg-white/10 border-b-2 border-primary flex items-center justify-center gap-2"
        >
          <Users className="h-4 w-4" />
          Messages
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 rounded-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!session?.user ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/50 mb-4">Login to message friends</p>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        ) : loadingConversations ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Conversations */}
            {conversations.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-white/50 px-2 py-1">RECENT</p>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      {conv.otherUser?.profilePhoto ? (
                        <img src={conv.otherUser.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">
                          {conv.otherUser?.fullName?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{conv.otherUser?.fullName || "Unknown"}</p>
                      <p className="text-xs text-white/50 truncate">
                        {conv.lastMessage?.isOwn && "You: "}
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conv.lastMessage && !conv.lastMessage.read && !conv.lastMessage.isOwn && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Friends to start new chat */}
            {filteredFriends.length > 0 && (
              <div className="p-2 border-t border-white/10">
                <p className="text-xs font-semibold text-white/50 px-2 py-1">START NEW CHAT</p>
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => startConversationWithFriend(friend.friendId)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500/50 to-emerald-500/50 flex items-center justify-center overflow-hidden shrink-0">
                      {friend.profilePhoto ? (
                        <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">{friend.fullName?.charAt(0) || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{friend.fullName}</p>
                      <p className="text-xs text-green-400">Friend</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {conversations.length === 0 && filteredFriends.length === 0 && (
              <div className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-white/20" />
                <p className="text-white/50">No conversations yet</p>
                <p className="text-xs text-white/30">Add friends to start chatting!</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  // Render bot view
  const renderBot = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
            <MessageCircle className="h-6 w-6 text-white" />
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
              <MessageCircle className="h-4 w-4" />
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

      {/* Mode Tabs */}
      {!isMinimized && session?.user && (
        <div className="flex border-b border-white/10">
          <button
            className="flex-1 py-3 text-sm font-medium text-white bg-white/10 border-b-2 border-primary flex items-center justify-center gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Bot
          </button>
          <button
            onClick={() => setChatMode("messages")}
            className="flex-1 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            Messages
          </button>
        </div>
      )}

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-3 ${message.role === "user"
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
    </>
  );

  return (
    <>
      {!isOpen && <div className="fixed z-[60] right-[clamp(12px,env(safe-area-inset-right)+12px,28px)] bottom-[clamp(36px,env(safe-area-inset-bottom)+28px,56px)] md:right-[clamp(16px,env(safe-area-inset-right)+12px,24px)] md:bottom-[clamp(24px,env(safe-area-inset-bottom)+24px,40px)]">{launcherButton}</div>}
      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-[55]"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 400 }}
              className={`fixed z-[60] ${isMobile ? "inset-0 flex justify-center items-end p-3" : "bottom-[clamp(24px,env(safe-area-inset-bottom)+20px,40px)] right-[clamp(20px,env(safe-area-inset-right)+20px,40px)] w-[400px]"}`}
            >
              <Card
                className={`flex flex-col shadow-2xl border-primary/50 bg-gradient-to-b from-background to-primary/5 ${isMobile ? "w-full h-[min(85vh,640px)] rounded-t-[24px] overflow-hidden" : "h-[650px] w-[420px]"
                  }`}
              >
                {chatMode === "conversation" ? renderConversation() :
                  chatMode === "messages" ? renderMessagesList() :
                    renderBot()}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
