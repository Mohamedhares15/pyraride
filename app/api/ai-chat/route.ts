import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import type { ChatCompletionCreateParams } from "groq-sdk/resources/chat/completions.mjs";

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const SYSTEM_PROMPT = `You are PyraRide AI, a professional concierge for a premium horse-riding booking platform at the Giza and Saqqara pyramids.

Goals:
- Provide warm, human-like help for riders and stable owners.
- Understand free-form questions: bookings, pricing, locations, account issues, reviews, cancellation, etc.
- Always reference live routes when guiding users: /stables, /dashboard/rider, /dashboard/stable, /profile, /faq, /contact, /gallery.
- Mention safety, verified stables, professional guides, best price guarantee when relevant.
- If asked for unavailable info, say so and offer alternatives.
- Respond concisely (2-4 short paragraphs max). Use bullet lists when helpful.

Format strictly as JSON:
{
  "answer": "string",
  "suggestions": ["Show me stables", "..."],
  "actions": { "Label": "/url" }
}
`;

type LLMResult = {
  answer: string;
  suggestions: string[];
  actions: Record<string, string>;
};

const defaultSuggestions = ["Show me stables", "How do I book?", "Pricing", "Contact support"];

function parseLLMResponse(raw: string): LLMResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer ?? raw,
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : defaultSuggestions,
        actions: typeof parsed.actions === "object" && parsed.actions !== null ? parsed.actions : {},
      };
    }
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
  }
  return {
    answer: raw,
    suggestions: defaultSuggestions,
    actions: {},
  };
}

async function fetchLLMResponse(message: string, history: Message[], session: any): Promise<LLMResult | null> {
  if (!groqClient) return null;
  try {
    const contextSummary = [
      "Key features: verified stables, pro guides, best price guarantee, instant booking, Stripe payments.",
      "Primary areas: Giza Plateau, Saqqara Desert.",
      "Support email: support@pyraride.com / Contact form: /contact.",
      `User role: ${session?.user?.role ?? "guest"}.`,
    ].join(" ");

    const messages: ChatCompletionCreateParams["messages"] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nContext:\n${contextSummary}` },
      ...history.map(
        (msg): ChatCompletionCreateParams["messages"][number] => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })
      ),
      { role: "user", content: message },
    ];

    const completion = await groqClient.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.4,
      messages,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    return parseLLMResponse(raw);
  } catch (error) {
    console.error("Groq error:", error);
    return null;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { message, conversationHistory = [] } = body as { message: string; conversationHistory?: Message[] };

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const llmResponse = await fetchLLMResponse(message, conversationHistory, session);
    if (llmResponse) {
      return NextResponse.json({
        response: llmResponse.answer,
        suggestions: llmResponse.suggestions,
        actions: llmResponse.actions,
        timestamp: new Date().toISOString(),
      });
    }

    const userMessage = message.toLowerCase();
    let response = "";
    let suggestions: string[] = [];
    let actions: Record<string, string> = {};

    // Enhanced AI understanding with better intent recognition
    const isBookingQuery = /book|booking|reserve|schedule|ride|appointment/i.test(userMessage);
    const isCancellationQuery = /cancel|cancellation|refund|cancel my/i.test(userMessage);
    const isRescheduleQuery = /reschedule|change|modify|move my/i.test(userMessage);
    const isReviewQuery = /review|rating|rate|feedback|star/i.test(userMessage);
    const isStableQuery = /stable|stables|find|where|location|places|available/i.test(userMessage);
    const isPriceQuery = /price|cost|pricing|money|payment|how much|fee/i.test(userMessage);
    const isLocationQuery = /giza|pyramid|saqqara|egypt|where/i.test(userMessage);
    const isAccountQuery = /login|sign in|account|register|sign up/i.test(userMessage);
    const isDashboardQuery = /dashboard|my bookings|my rides|bookings/i.test(userMessage);
    const isHelpQuery = /help|how|what|guide|tutorial|assist/i.test(userMessage);
    const isGreetingQuery = /hello|hi|hey|greetings|good morning|good evening/i.test(userMessage);

    // Generate context-aware response
    if (isGreetingQuery) {
      const sessionData = session as any;
      const userName = sessionData?.user?.name || "there";
      const userRole = sessionData?.user?.role || "guest";

      response = `Hello ${userName}! 👋 Welcome to PyraRide!

I'm here to help you explore amazing horse riding experiences at the Giza Pyramids and Saqqara.

I can help you with:
🐴 Finding the perfect stable
📅 Booking rides
✏️ Managing your bookings
⭐ Leaving reviews
💰 Understanding pricing
📍 Location information

${userRole === "rider" ? "What would you like to do today?" : "How can I assist you?"}`;

      suggestions = [
        "Show me stables",
        "How do I book?",
        "What are the prices?",
        "Find stables in Giza"
      ];
    }
    else if (isBookingQuery) {
      // Fetch available stables for booking
      const availableStables = await prisma.stable.findMany({
        where: { status: "approved" },
        take: 5,
        select: {
          id: true,
          name: true,
          location: true,
          description: true,
        },
      });

      if (availableStables.length > 0) {
        const stableList = availableStables.map((s: any, i: number) => 
          `${i + 1}. **${s.name}** (${s.location})\n   ${s.description.substring(0, 100)}...`
        ).join("\n\n");

        response = `🐴 Ready to book your unforgettable ride! Here's how:\n\n**Step 1:** Browse our stables\n**Step 2:** Select your stable and horse\n**Step 3:** Choose date & time\n**Step 4:** Complete secure payment\n\n**Available Stables:**\n\n${stableList}\n\nClick any stable to start your booking!`;
      } else {
        response = `🐴 Let me help you book your Giza Pyramid ride!\n\n**Quick Steps:**\n1. Visit /stables to browse\n2. Click "Book Now" on your preferred stable\n3. Select horse and time slot\n4. Complete payment\n\nAll our stables are vetted for safety and quality!`;
      }

      suggestions = ["Show me stables", "What's the price?", "How long is a ride?"];
      actions = { "View Stables": "/stables", "My Dashboard": "/dashboard/rider" };
    }
    else if (isStableQuery) {
      // Fetch and display real stables
      const stables = await prisma.stable.findMany({
        where: { status: "approved" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          location: true,
          description: true,
        },
      });

      if (stables.length > 0) {
        const stableInfo = stables.map((s: any) => 
          `🐴 **${s.name}**\n📍 ${s.location}\n${s.description.substring(0, 80)}...`
        ).join("\n\n");

        response = `🐴 Here are our amazing stables:\n\n${stableInfo}\n\n✨ Each stable is carefully vetted for safety, quality horses, and unforgettable experiences. Click any one to view details and book!`;

        suggestions = ["Show me more", "Book now", "Tell me about prices"];
        actions = { "Browse All": "/stables" };
      } else {
        response = `🐴 We're setting up amazing stables near the Pyramids! Check back soon or contact us for exclusive early access.`;
      }
    }
    else if (isPriceQuery) {
      response = `💰 **Pricing Information:**\n\n**Standard Rates:**\n- $50 per hour (most stables)\n- $40-60 range depending on location\n\n**Platform Fees:**\n- 20% commission\n- You pay 80% to the stable\n- Full transparency\n\n**Payment:**\n✅ Secure Stripe integration\n✅ Full payment at booking\n✅ Instant confirmation\n\n**Special Offers:**\n- Group discounts available\n- Multi-hour bookings save 10%\n- Sunset rides: premium pricing`;

      suggestions = ["Book now", "Show stables", "What's included?"];
    }
    else if (isCancellationQuery) {
      if (session) {
        response = `❌ **Canceling Your Booking:**\n\n**Steps:**\n1. Go to /dashboard/rider\n2. Find your booking\n3. Click "Cancel"\n4. Add reason (optional)\n5. Confirm\n\n**Refund Policy:**\n- Cancelled 48h+ before: Full refund\n- Cancelled 24-48h before: 50% refund\n- Cancelled <24h before: No refund\n\nThe stable owner will process your refund.`;

        suggestions = ["View my bookings", "Contact support", "Help"];
        actions = { "My Bookings": "/dashboard/rider" };
      } else {
        response = `❌ Please sign in to cancel bookings. Visit /dashboard/rider to manage your reservations.`;
        actions = { "Sign In": "/auth/signin" };
      }
    }
    else if (isRescheduleQuery) {
      if (session) {
        response = `🔄 **Rescheduling Made Easy:**\n\n**Steps:**\n1. Go to /dashboard/rider\n2. Find your confirmed booking\n3. Click "Reschedule"\n4. Choose new date & time\n5. Confirm changes\n\n✨ Available slots update in real-time!\n\nI can check availability for you. What date are you interested in?`;

        suggestions = ["My bookings", "Check availability", "Help"];
        actions = { "View Bookings": "/dashboard/rider" };
      } else {
        response = `🔄 Please sign in to reschedule. Your bookings are waiting in your dashboard!`;
      }
    }
    else if (isReviewQuery) {
      response = `⭐ **Leave a Review:**\n\nAfter your completed ride:\n1. Go to /dashboard/rider\n2. Find completed booking\n3. Click "Write Review"\n4. Rate stable (1-5 stars)\n5. Rate horse (1-5 stars)\n6. Add comment (optional)\n7. Submit\n\n📝 Your reviews help other riders choose!\n\n🎁 Reviews earn you 10% off your next booking!`;

      suggestions = ["My bookings", "How ratings work", "Thanks"];
      actions = { "My Dashboard": "/dashboard/rider" };
    }
    else if (isLocationQuery) {
      const gizaMatch = /giza|pyramid/i.test(userMessage);
      const saqqaraMatch = /saqqara/i.test(userMessage);

      if (gizaMatch || !saqqaraMatch) {
        const gizaStables = await prisma.stable.findMany({
          where: { 
            status: "approved",
            location: { contains: "Giza", mode: "insensitive" }
          },
          take: 3,
          select: { name: true, location: true },
        });

        const stableList = gizaStables.length > 0 
          ? gizaStables.map((s: any) => `• ${s.name}`).join("\n")
          : "• Premium Giza stables available";

        response = `📍 **Giza Pyramids Area**\n\n**Location:**\n- Near the Great Pyramid of Giza\n- Classic pyramid viewing experience\n- 30-60 minute rides\n\n**Available Stables:**\n${stableList}\n\n🌅 **Best Times:**\n- Sunrise (6-8 AM)\n- Sunset (5-7 PM)\n- Avoid midday heat\n\nBook your unforgettable Pyramids experience!`;

        suggestions = ["Book Giza ride", "Show me", "Pricing"];
      } else {
        response = `📍 **Saqqara Area**\n\n**Location:**\n- Ancient Step Pyramid area\n- Historical necropolis\n- Scenic desert trails\n\n**Experience:**\n- Step Pyramid views\n- Ancient sites nearby\n- Less crowded than Giza\n- Historic atmosphere\n\nPerfect for history lovers!`;

        suggestions = ["Find Saqqara stables", "Compare with Giza"];
      }

      actions = { "Browse Stables": "/stables" };
    }
    else if (isAccountQuery) {
      response = `🔐 **Account Access:**\n\n**Sign In:**\n1. Click "Sign In" (top navigation)\n2. Enter email & password\n3. Click "Sign In"\n\n**Sign Up:**\n1. Click "Sign Up"\n2. Enter your details\n3. Create secure password\n4. Submit\n\n✅ Your account lets you:\n- Book rides\n- Track bookings\n- Leave reviews\n- Manage profile`;

      actions = { "Sign In": "/auth/signin", "Sign Up": "/auth/signup" };
    }
    else if (isDashboardQuery) {
      if (session) {
        const sessionData = session as any;
        const userRole = sessionData?.user?.role || "rider";
        
        const dashPath = userRole === "rider" 
          ? "/dashboard/rider" 
          : userRole === "stable_owner"
          ? "/dashboard/stable"
          : "/dashboard";

        response = `📊 **Your Dashboard:**\n\nAccess your dashboard to:\n${userRole === "rider" 
          ? "- View all bookings\n- Manage reservations\n- Cancel or reschedule\n- Leave reviews\n- Track history"
          : "- View stable stats\n- Manage horses\n- Track bookings\n- View analytics"
        }\n\nReady to manage your ${userRole === "rider" ? "rides" : "stable"}?`;

        actions = { "Open Dashboard": dashPath };
      } else {
        response = `📊 Please sign in to access your dashboard with all your bookings and information.`;
      }
    }
    else if (isHelpQuery) {
      response = `❓ **I'm Here to Help!**\n\n**I can assist with:**\n\n🐴 **Booking & Rides**\n- Find stables\n- Book rides\n- Understand pricing\n\n📅 **Manage Bookings**\n- View reservations\n- Cancel bookings\n- Reschedule\n\n⭐ **Reviews & Ratings**\n- Leave feedback\n- Rate experiences\n\n💡 **Platform Navigation**\n- Account management\n- Dashboard access\n- Payment help\n\n**Try asking:**\n"Show me stables"\n"How do I book?"\n"What are prices?"\n\nWhat do you need help with?`;

      suggestions = ["Show me stables", "How to book", "Pricing"];
    }
    else {
      // Fallback with helpful suggestions
      response = `I understand you're asking about: "${message}"\n\n**Let me help you with:**\n\n🐴 Finding and booking stables\n💰 Understanding prices\n📅 Managing bookings\n⭐ Leaving reviews\n📍 Location information\n\n**Try asking:**\n- "Show me stables"\n- "How do I book a ride?"\n- "What are the prices?"\n- "Find stables in Giza"\n\nWhat would you like to know?`;

      suggestions = ["Show stables", "How to book", "Pricing", "Help me"];
    }

    return NextResponse.json({
      response,
      suggestions,
      actions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      {
        response: "I'm experiencing technical difficulties. Please try again or refresh the page.",
        suggestions: ["Refresh page", "Contact support", "Try again"],
        actions: {},
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
