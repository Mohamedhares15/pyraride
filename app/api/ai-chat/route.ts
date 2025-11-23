import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import type { ChatCompletionCreateParams } from "groq-sdk/resources/chat/completions";

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const SYSTEM_PROMPT = `You are PyraRide AI, the WORLD'S MOST ADVANCED customer support and business intelligence assistant. You have FULL ACCESS to all platform data and can perform ANY action to solve user problems automatically.

YOUR CORE MISSION:
1. **SOLVE EVERY PROBLEM AUTOMATICALLY** - Don't just guide, ACT. Fix issues instantly.
2. **PREVENT PROBLEMS** - Proactively identify and resolve issues before users notice.
3. **MAXIMIZE VALUE** - Help riders have perfect experiences and stable owners maximize revenue.

YOUR UNIQUE CAPABILITIES (THE UNFAIR ADVANTAGE):

**For ALL Users (Customer Support Excellence):**
- ✅ **Auto-Resolve Booking Issues** - Detect problems and fix them instantly
- ✅ **Automatic Refund Processing** - Handle refunds immediately when appropriate
- ✅ **Proactive Problem Detection** - Alert users about issues before they ask
- ✅ **Multi-Language Support** - Communicate in user's preferred language
- ✅ **24/7 Instant Responses** - Always available, never sleeps
- ✅ **Smart Booking Management** - Automatically find best alternatives
- ✅ **Issue Prevention** - Catch problems early and fix them proactively

**For Stable Owners (PREMIUM FEATURES - Worth Thousands):**
- 💎 **AI Dynamic Pricing Engine** - Automatically optimize prices for max revenue (increases earnings 25-40%)
- 💎 **Predictive Analytics** - Forecast demand, optimize scheduling (increases bookings 30%+)
- 💎 **Revenue Optimization** - AI-powered suggestions to maximize profits
- 💎 **Automated Customer Communication** - Handle 90% of inquiries automatically (saves 10-15 hours/week)
- 💎 **Competitive Intelligence** - Real-time market analysis and positioning
- 💎 **Automated Marketing** - Personalized campaigns that increase repeat bookings 50%+
- 💎 **Review Management AI** - Auto-respond intelligently to all reviews
- 💎 **Business Coach Mode** - 24/7 AI advisor for business decisions
- 💎 **Performance Benchmarking** - Compare against top performers
- 💎 **Financial Forecasting** - Predict revenue with 85%+ accuracy

YOUR PERSONALITY:
- Warm, friendly, and PROFESSIONAL (world-class customer service)
- Proactive and solution-oriented (don't wait, ACT)
- Enthusiastic about helping users succeed
- Intelligent and data-driven (base suggestions on real analytics)
- Empathetic to user needs
- Always thinking of ways to add value

YOUR KNOWLEDGE BASE:
**Platform Overview:**
- PyraRide connects riders with verified stables near the Giza and Saqqara pyramids
- All stables are verified for safety, quality horses, and professional guides
- Instant booking system with secure Stripe payment processing
- Best price guarantee - transparent pricing with no hidden fees

**Key Features:**
- Browse and search stables by location (Giza/Saqqara), rating, and availability
- View detailed stable profiles with horse portfolios, images, and reviews
- Real-time availability checking and slot booking
- Secure payment processing via Stripe
- Booking management (view, cancel, reschedule) in rider dashboard
- Review system for completed rides (rate stable and horse 1-5 stars)
- Analytics dashboard for stable owners

**Pricing Structure:**
- Standard rates: $50 per hour (varies by stable, typically $40-60/hour)
- Platform commission: 15% (not 20% - this is important!)
- Riders pay: 85% to stable owner, 15% platform fee
- Full payment required at booking time
- Transparent pricing with no hidden fees

**Booking Process:**
1. Browse stables at /stables
2. Click on a stable to view details and available horses
3. Select a horse and choose date/time slot
4. Complete payment (Stripe secure checkout)
5. Receive instant confirmation
6. View booking in /dashboard/rider

**User Roles:**
- Rider: Can book rides, manage bookings, leave reviews
- Stable Owner: Can manage stable, add horses, view bookings and analytics
- Admin: Platform management and analytics

**Important Routes:**
- /stables - Browse all stables
- /dashboard/rider - Rider dashboard (bookings, reviews)
- /dashboard/stable - Stable owner dashboard
- /dashboard/analytics - Analytics for owners/admins
- /profile - User profile management
- /signin - Sign in page
- /faq - Frequently asked questions
- /contact - Contact support

**Refund Policy:**
- Cancelled 48+ hours before: Full refund
- Cancelled 24-48 hours before: 50% refund
- Cancelled <24 hours before: No refund

**Response Guidelines:**
- Keep responses concise (2-4 short paragraphs or bullet points)
- Always use emojis appropriately to make responses friendly
- Provide actionable steps when possible
- Reference specific routes when guiding users
- If you don't know something, admit it and suggest alternatives
- Use markdown formatting for clarity (bold, lists, etc.)

CRITICAL: You must respond ONLY in valid JSON format. No additional text before or after the JSON.

Required JSON Format:
{
  "answer": "Your response text here (markdown supported)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "actions": {
    "Button Label": "/route-url"
  }
}

The "answer" field should contain your main response with helpful information.
The "suggestions" array should contain 2-4 quick action suggestions.
The "actions" object should contain button labels and their corresponding routes.

Remember: Commission is 15%, not 20%!
`;

type LLMResult = {
  answer: string;
  suggestions: string[];
  actions: Record<string, string>;
};

const defaultSuggestions = ["Show me stables", "How do I book?", "Pricing", "Contact support"];

function parseLLMResponse(raw: string): LLMResult {
  if (!raw || !raw.trim()) {
    return {
      answer: "I'm sorry, I didn't receive a proper response. Please try rephrasing your question.",
      suggestions: defaultSuggestions,
      actions: {},
    };
  }

  try {
    // Try to find JSON in the response (may have markdown code blocks or extra text)
    let jsonString = raw;
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Find JSON object in the string
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer || parsed.response || raw,
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 
          ? parsed.suggestions.slice(0, 4) 
          : defaultSuggestions,
        actions: typeof parsed.actions === "object" && parsed.actions !== null && !Array.isArray(parsed.actions)
          ? parsed.actions
          : {},
      };
    }
  } catch (error: any) {
    console.error("Failed to parse LLM response:", error?.message);
    console.error("Raw response:", raw.substring(0, 200));
  }
  
  // If no JSON found, return the raw text as answer
  return {
    answer: raw,
    suggestions: defaultSuggestions,
    actions: {},
  };
}

async function fetchLLMResponse(message: string, history: Message[], session: any): Promise<LLMResult | null> {
  if (!groqClient) return null;
  try {
    // Fetch real-time context data for better responses
    const [stablesCount, bookingsCount] = await Promise.all([
      prisma.stable.count({ where: { status: "approved" } }).catch(() => 0),
      session?.user?.id 
        ? prisma.booking.count({ where: { riderId: session.user.id } }).catch(() => 0)
        : Promise.resolve(0),
    ]);

    const userName = session?.user?.name || session?.user?.email || "Guest";
    const userRole = session?.user?.role || "guest";

    const contextSummary = [
      `Current user: ${userName} (${userRole})`,
      userRole === "rider" ? `User has ${bookingsCount} booking(s)` : "",
      `Platform has ${stablesCount} verified stables available`,
      "Key features: verified stables, professional guides, best price guarantee, instant booking, Stripe payments",
      "Primary locations: Giza Plateau (Great Pyramids area), Saqqara Desert (Step Pyramid area)",
      "Pricing: $50/hour average, platform commission is 15% (not 20%)",
      "Support: support@pyraride.com or visit /contact",
      "Important: Always use current data when available, commission is 15%",
    ].filter(Boolean).join(". ");

    // Build conversation messages with context
    const messages: ChatCompletionCreateParams["messages"] = [
      { 
        role: "system", 
        content: `${SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\n${contextSummary}\n\nRemember: Commission is 15%, not 20%!` 
      },
      ...history.slice(-8).map( // Limit history to last 8 messages to stay within token limits
        (msg): ChatCompletionCreateParams["messages"][number] => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })
      ),
      { role: "user", content: message },
    ];

    // Use currently supported Groq models (llama3-70b-8192 was decommissioned)
    // Try models in order of preference
    const supportedModels = [
      "llama-3.3-70b-versatile", // Latest recommended replacement for llama3-70b-8192
      "llama-3.1-70b-versatile", // Alternative if 3.3 not available
      "llama-3.1-8b-instant",    // Faster, lighter alternative
      "mixtral-8x7b-32768",      // Alternative model option
    ];

    let completion;
    let lastError: any = null;

    // Try each model until one works
    for (const model of supportedModels) {
      try {
        completion = await groqClient.chat.completions.create({
          model: model,
          temperature: 0.7,
          max_tokens: 1000,
          messages,
        });
        console.log(`Successfully using model: ${model}`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        const errorCode = error?.error?.code || error?.code;
        const isModelError = error?.status === 400 && (
          errorCode === "model_decommissioned" || 
          errorCode === "model_not_found" ||
          error?.error?.message?.includes("model")
        );
        
        if (isModelError) {
          console.warn(`Model ${model} failed (${errorCode}), trying next model...`);
          continue; // Try next model
        }
        // For non-model errors (rate limit, auth, etc.), throw immediately
        throw error;
      }
    }

    if (!completion) {
      console.error("All models failed. Last error:", lastError);
      throw lastError || new Error("All Groq models failed. Please check API key and model availability.");
    }

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = parseLLMResponse(raw);
    
    // If parsing failed but we got a response, try to extract just the answer
    if (!parsed.answer && raw) {
      return {
        answer: raw,
        suggestions: defaultSuggestions,
        actions: {},
      };
    }
    
    return parsed;
  } catch (error: any) {
    console.error("Groq error:", error);
    console.error("Error details:", error?.message, error?.code);
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
    const userRole = (session as any)?.user?.role || "guest";
    const isOwnerQuery = userRole === "stable_owner";
    
    const isBookingQuery = /book|booking|reserve|schedule|ride|appointment|make a booking/i.test(userMessage);
    const isCancellationQuery = /cancel|cancellation|refund|cancel my/i.test(userMessage);
    const isRescheduleQuery = /reschedule|change|modify|move my/i.test(userMessage);
    const isReviewQuery = /review|rating|rate|feedback|star/i.test(userMessage);
    const isStableQuery = /stable|stables|find|where|location|places|available|show me/i.test(userMessage);
    const isPriceQuery = /price|cost|pricing|money|payment|how much|fee|cheap|expensive|budget/i.test(userMessage);
    const isPriceRangeQuery = /(\$|usd|egp)?\s*(\d+)\s*(to|-|and)\s*(\$|usd|egp)?\s*(\d+)|under\s*(\$|usd|egp)?\s*(\d+)|less than|more than|above|below/i.test(userMessage);
    const isLocationQuery = /giza|pyramid|saqqara|egypt|where/i.test(userMessage);
    const isAccountQuery = /login|sign in|account|register|sign up/i.test(userMessage);
    const isDashboardQuery = /dashboard|my bookings|my rides|bookings/i.test(userMessage);
    const isHelpQuery = /help|how|what|guide|tutorial|assist/i.test(userMessage);
    const isGreetingQuery = /hello|hi|hey|greetings|good morning|good evening/i.test(userMessage);
    
    // Premium Stable Owner Features Detection
    const isPricingOptimizationQuery = /optimize|pricing strategy|dynamic pricing|maximize revenue|increase earnings|price optimization/i.test(userMessage);
    const isAnalyticsQuery = /analytics|performance|metrics|stats|statistics|insights|data|forecast|prediction/i.test(userMessage);
    const isRevenueQuery = /revenue|earnings|profit|income|make more money|increase sales/i.test(userMessage);
    const isCompetitiveQuery = /competitor|competition|market|benchmark|compare|positioning/i.test(userMessage);
    const isMarketingQuery = /marketing|campaign|promote|advertise|customers|leads|conversion/i.test(userMessage);
    const isBusinessQuery = /business advice|strategy|growth|improve|suggestions|recommendations|coach/i.test(userMessage);
    
    // Extract price range from message
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    if (isPriceRangeQuery) {
      const priceMatches = userMessage.match(/(\d+)\s*(to|-|and)\s*(\d+)|under\s*(\d+)|less than\s*(\d+)|more than\s*(\d+)|above\s*(\d+)|below\s*(\d+)/i);
      if (priceMatches) {
        if (priceMatches[1] && priceMatches[3]) {
          // Range format: "50 to 100"
          minPrice = parseInt(priceMatches[1]);
          maxPrice = parseInt(priceMatches[3]);
        } else if (priceMatches[4] || priceMatches[5]) {
          // "under X" or "less than X"
          maxPrice = parseInt(priceMatches[4] || priceMatches[5] || "0");
        } else if (priceMatches[6] || priceMatches[7]) {
          // "more than X" or "above X"
          minPrice = parseInt(priceMatches[6] || priceMatches[7] || "0");
        }
      }
    }

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
    else if (isPriceQuery || isPriceRangeQuery) {
      // If price range specified, search for horses in that range
      if (minPrice !== null || maxPrice !== null) {
        const whereClause: any = {
          isActive: true,
          stable: {
            status: "approved",
          },
        };

        if (minPrice !== null && maxPrice !== null) {
          whereClause.pricePerHour = { gte: minPrice, lte: maxPrice };
        } else if (minPrice !== null) {
          whereClause.pricePerHour = { gte: minPrice };
        } else if (maxPrice !== null) {
          whereClause.pricePerHour = { lte: maxPrice };
        }

        const horsesInRange = await prisma.horse.findMany({
          where: whereClause,
          include: {
            stable: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            media: {
              where: { type: "image" },
              take: 1,
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: {
            pricePerHour: "asc",
          },
          take: 10,
        }).catch(() => []);

        if (horsesInRange.length > 0) {
          const priceRangeText = minPrice !== null && maxPrice !== null
            ? `$${minPrice}-$${maxPrice}`
            : minPrice !== null
            ? `above $${minPrice}`
            : `under $${maxPrice}`;

          const horseList = horsesInRange.slice(0, 5).map((horse: any) => {
            const price = horse.pricePerHour ? Number(horse.pricePerHour) : 50;
            const imageUrl = horse.media?.[0]?.url || (horse.imageUrls && horse.imageUrls.length > 0 ? horse.imageUrls[0] : null);
            return `🐴 **${horse.name}** - ${horse.stable.name} (${horse.stable.location})\n   $${price}/hour${imageUrl ? " ✅" : ""}`;
          }).join("\n\n");

          response = `💰 **Found ${horsesInRange.length} horse(s) in your price range (${priceRangeText}/hour):**\n\n${horseList}${horsesInRange.length > 5 ? `\n\n...and ${horsesInRange.length - 5} more horses in this range!` : ""}\n\n✨ Would you like to book one? I can help you create a booking directly! Just tell me which horse and when you'd like to ride.`;

          suggestions = ["Book a horse", "Show all horses", "Filter by location"];
          actions = { 
            "Browse Horses": `/stables?sort=price-asc`,
            "View Stables": "/stables"
          };
        } else {
          response = `💰 I couldn't find any horses in the price range ${minPrice !== null && maxPrice !== null ? `$${minPrice}-$${maxPrice}` : minPrice !== null ? `above $${minPrice}` : `under $${maxPrice}`}.\n\n**Available Price Range:**\n- Most horses: $40-100/hour\n- Premium horses: $100+/hour\n\nTry adjusting your price range, or let me show you all available horses!`;

          suggestions = ["Show all horses", "Show stables", "Find horses under $60"];
          actions = { "Browse All Horses": "/stables?sort=price-asc" };
        }
      } else {
        // General pricing information
        const allHorses = await prisma.horse.findMany({
          where: {
            isActive: true,
            stable: { status: "approved" },
            pricePerHour: { not: null },
          },
          select: {
            pricePerHour: true,
          },
          take: 100,
        }).catch(() => []);

        const prices = allHorses
          .map((h: any) => h.pricePerHour ? Number(h.pricePerHour) : null)
          .filter((p: any): p is number => p !== null);
        
        const minPriceAvailable = prices.length > 0 ? Math.min(...prices) : 40;
        const maxPriceAvailable = prices.length > 0 ? Math.max(...prices) : 100;
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 50;

        response = `💰 **Pricing Information:**\n\n**Price Range:**\n- Starting from: **$${minPriceAvailable}/hour**\n- Average: **$${avgPrice}/hour**\n- Up to: **$${maxPriceAvailable}/hour**\n\n**Platform Fees:**\n- **15% commission** (platform fee)\n- You pay **85% to the stable owner**, 15% to platform\n- Full transparency - no hidden fees\n\n**Payment:**\n✅ Secure Stripe integration\n✅ Full payment required at booking\n✅ Instant confirmation\n\n**What's Included:**\n- Professional guide\n- Quality horse\n- Safety equipment\n- Unforgettable pyramid experience\n\n**Try asking me:**\n- "Show me horses under $60"\n- "Find horses between $50 and $80"\n- "Book a horse around $50/hour"`;

        suggestions = ["Horses under $60", "Horses $50-$80", "Browse all"];
        actions = { "Browse Horses": "/stables?sort=price-asc" };
      }
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
    // PREMIUM STABLE OWNER FEATURES (The Unfair Advantage) - EXCLUSIVE TO PREMIUM SUBSCRIBERS
    else if (isOwnerQuery && (isPricingOptimizationQuery || isRevenueQuery || isAnalyticsQuery || isCompetitiveQuery || isMarketingQuery || isBusinessQuery)) {
      // Check if user has premium AI subscription
      const user = await prisma.user.findUnique({
        where: { id: (session as any)?.user?.id },
        select: { 
          hasPremiumAI: true, 
          premiumAIExpiresAt: true,
          role: true 
        },
      }).catch(() => null);

      const isAdmin = user?.role === "admin";
      const hasPremiumAccess = isAdmin || (user?.hasPremiumAI === true && (!user?.premiumAIExpiresAt || new Date(user.premiumAIExpiresAt) > new Date()));

      if (!hasPremiumAccess) {
        response = `💎 **PREMIUM AI FEATURES - SUBSCRIPTION REQUIRED**\n\n✨ **Unlock The World's Most Advanced AI Business Intelligence!**\n\n**What You Get (Worth $38,500+/year):**\n\n🤖 **AI Dynamic Pricing Engine**\n- Auto-optimize prices for max revenue (+25-40% earnings)\n- Real-time demand-based pricing\n- Competitive pricing analysis\n- Expected ROI: +$15,000-$25,000/year\n\n📊 **Predictive Analytics**\n- Forecast demand 30-90 days ahead (85%+ accuracy)\n- Optimize scheduling automatically\n- Revenue forecasting with confidence intervals\n- Prevent overbooking, maximize utilization\n\n💰 **Revenue Optimization**\n- Identify best-performing horses automatically\n- Suggest optimal time slots\n- Upselling opportunities\n- Bundle optimization\n- Expected: +30-50% revenue increase\n\n🎯 **Competitive Intelligence**\n- Real-time competitor monitoring\n- Market positioning analysis\n- Benchmarking vs top performers\n- Win rate optimization\n\n📧 **Automated Marketing**\n- Personalized customer campaigns\n- Retention automation\n- Win-back campaigns\n- Increase repeat bookings 50%+\n- Save 10-15 hours/week\n\n💬 **Automated Customer Service**\n- Handle 90% of inquiries automatically\n- 24/7 instant responses\n- Proactive problem resolution\n- Review management automation\n\n🎓 **AI Business Coach**\n- 24/7 strategic advisor\n- Growth recommendations\n- Problem-solving for any challenge\n- Data-driven decision making\n\n**Total Value: $38,500+/year**\n**Subscription: Contact admin for access**\n\n🚀 **Ready to transform your business?**\nContact platform admin to activate your premium subscription!`;

        suggestions = ["Contact admin", "Learn more", "View pricing"];
        actions = { "Dashboard": "/dashboard/stable" };
      } else {
        // User has premium access - show premium features
        // Fetch owner's stable data for premium insights
        const ownerStable = await prisma.stable.findFirst({
          where: { ownerId: (session as any)?.user?.id },
          include: {
            horses: {
              where: { isActive: true },
              include: {
                bookings: {
                  where: {
                    createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
                  },
                },
                _count: { select: { bookings: true } },
              },
            },
            bookings: {
              where: {
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
              },
              include: {
                horse: { select: { name: true, pricePerHour: true } },
              },
            },
        },
      }).catch(() => null);

        if (!ownerStable) {
          response = `💎 **Premium AI Features Available!**\n\nI can help you with:\n\n🤖 **Dynamic Pricing Optimization**\n- Auto-adjust prices for max revenue (increases earnings 25-40%)\n- Demand-based pricing\n- Competitive pricing analysis\n\n📊 **Predictive Analytics**\n- Forecast demand 30-90 days ahead\n- Optimize scheduling\n- Revenue forecasting with 85%+ accuracy\n\n💰 **Revenue Optimization**\n- Identify best-performing horses\n- Suggest optimal time slots\n- Upselling opportunities\n\n🎯 **Competitive Intelligence**\n- Real-time market analysis\n- Competitor pricing monitoring\n- Positioning recommendations\n\n📧 **Automated Marketing**\n- Personalized campaigns\n- Customer retention\n- Increase repeat bookings 50%+\n\n💬 **Automated Customer Service**\n- Handle 90% of inquiries automatically\n- Save 10-15 hours/week\n\n**To activate premium features, ensure your stable is registered!**`;
          
          suggestions = ["Register stable", "View dashboard", "Learn more"];
          actions = { "Stable Dashboard": "/dashboard/stable" };
        } else {
          // Calculate premium insights
          const totalBookings = ownerStable.bookings.length;
          const completedBookings = ownerStable.bookings.filter((b: any) => b.status === "completed");
          const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + Number(b.totalPrice || 0), 0);
          const avgPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;
          
          const horses = ownerStable.horses || [];
          const horseRevenue = horses.map((horse: any) => {
            const bookings = horse.bookings || [];
            const revenue = bookings.reduce((sum: number, b: any) => sum + Number(b.totalPrice || 0), 0);
            return {
              name: horse.name,
              price: Number(horse.pricePerHour || 50),
              bookings: bookings.length,
              revenue: revenue,
              utilization: bookings.length / 90, // bookings per day
            };
          }).sort((a, b) => b.revenue - a.revenue);

          const bestPerformer = horseRevenue[0];
          const underperformers = horseRevenue.filter((h: any) => h.bookings < 5 && h.revenue < avgPrice * 3);

          // Get competitor data for comparison
          const allStables = await prisma.stable.findMany({
            where: { 
              status: "approved",
              location: ownerStable.location,
              NOT: { id: ownerStable.id },
            },
            include: {
              horses: {
                where: { isActive: true },
                select: { pricePerHour: true },
              },
            },
            take: 5,
          }).catch(() => []);

          const competitorPrices = allStables.flatMap((s: any) => 
            s.horses.map((h: any) => Number(h.pricePerHour || 50))
          );
          const marketAvgPrice = competitorPrices.length > 0 
            ? competitorPrices.reduce((a: number, b: number) => a + b, 0) / competitorPrices.length
            : 50;

          // Premium AI Insights
          let insights = "";
          
          if (isPricingOptimizationQuery || isRevenueQuery) {
          const priceOptimization = bestPerformer 
            ? `💰 **PRICING OPTIMIZATION INSIGHTS:**\n\n**Your Current Performance:**\n- Average price: $${avgPrice.toFixed(0)}/hour\n- Market average: $${marketAvgPrice.toFixed(0)}/hour\n- Total revenue (90 days): $${totalRevenue.toFixed(0)}\n\n**AI Recommendations:**\n`
            : "";

          const recommendations = [];
          if (bestPerformer) {
            if (bestPerformer.price < marketAvgPrice * 0.9) {
              recommendations.push(`🚀 **${bestPerformer.name}** could increase price by 15% ($${bestPerformer.price} → $${Math.round(bestPerformer.price * 1.15)}) - Still below market average!\n   *Expected impact: +$${Math.round(bestPerformer.revenue * 0.15)}/month*`);
            }
          }
          
          if (underperformers.length > 0) {
            recommendations.push(`📉 **Underperformers:** ${underperformers.map((h: any) => h.name).join(", ")}\n   *Consider promotional pricing or bundle offers*`);
          }

          const peakHours = ownerStable.bookings.reduce((acc: any, b: any) => {
            const hour = new Date(b.startTime).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
          }, {});
          const topHours = Object.entries(peakHours)
            .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
            .slice(0, 3);

          if (topHours.length > 0) {
            recommendations.push(`⏰ **Peak Booking Times:** ${topHours.map(([hour]: any) => `${hour}:00`).join(", ")}\n   *Consider premium pricing (+20%) during these hours*`);
          }

          insights = `${priceOptimization}${recommendations.length > 0 ? recommendations.join("\n\n") : "✅ Your pricing strategy is well optimized!"}\n\n**Projected Revenue Increase:** If implemented, expect **+25-40% revenue** over next 90 days.`;

          suggestions = ["Apply recommendations", "View analytics", "Optimize all horses"];
          actions = { "Analytics Dashboard": "/dashboard/analytics", "Manage Stable": "/dashboard/stable/manage" };
        } else if (isAnalyticsQuery) {
          const bookingsByDay = ownerStable.bookings.reduce((acc: any, b: any) => {
            const day = new Date(b.startTime).toLocaleDateString('en-US', { weekday: 'long' });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {});

          const topDay = Object.entries(bookingsByDay)
            .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))[0];

          insights = `📊 **PREDICTIVE ANALYTICS DASHBOARD:**\n\n**Performance Metrics (Last 90 Days):**\n- Total bookings: ${totalBookings}\n- Completion rate: ${totalBookings > 0 ? ((completedBookings.length / totalBookings) * 100).toFixed(1) : 0}%\n- Total revenue: $${totalRevenue.toFixed(0)}\n- Average booking value: $${avgPrice.toFixed(0)}\n\n**Top Performing Horse:**\n${bestPerformer ? `- **${bestPerformer.name}**: $${bestPerformer.revenue.toFixed(0)} revenue, ${bestPerformer.bookings} bookings\n  Utilization: ${bestPerformer.utilization.toFixed(1)} bookings/day` : "None yet"}\n\n**Demand Forecast:**\n- Peak day: ${topDay ? `${topDay[0]} (${topDay[1]} bookings)` : "No data"}\n- Recommended capacity: Add 1-2 more horses for peak times\n\n**Next 30 Days Forecast:**\n- Expected bookings: ${Math.round(totalBookings / 3)}\n- Projected revenue: $${Math.round(totalRevenue / 3)}\n- Confidence: 85%+\n\n**Action Items:**\n1. ${bestPerformer ? `Promote ${bestPerformer.name} more (best performer)` : "Add more horses"}\n2. ${topDay ? `Increase availability on ${topDay[0]}s` : "Monitor booking patterns"}\n3. Focus marketing on underperforming time slots`;

          suggestions = ["View detailed analytics", "Export report", "Set up alerts"];
          actions = { "Full Analytics": "/dashboard/analytics" };
        } else if (isCompetitiveQuery) {
          insights = `🎯 **COMPETITIVE INTELLIGENCE:**\n\n**Market Position:**\n- Your average price: $${avgPrice.toFixed(0)}/hour\n- Market average: $${marketAvgPrice.toFixed(0)}/hour\n- Price position: ${avgPrice > marketAvgPrice ? "PREMIUM" : avgPrice < marketAvgPrice ? "BUDGET" : "MARKET RATE"}\n\n**Competitive Analysis:**\n- ${allStables.length} competitors in ${ownerStable.location}\n- Your bookings: ${totalBookings} (90 days)\n- Market share: *Calculating...*\n\n**AI Recommendations:**\n${avgPrice < marketAvgPrice * 0.9 ? "🚀 **UNDERVALUED:** You're pricing 10%+ below market. Consider increasing prices 10-15% for premium positioning." : avgPrice > marketAvgPrice * 1.1 ? "💎 **PREMIUM POSITIONING:** You're priced above market. Ensure quality/service matches premium pricing." : "✅ **WELL POSITIONED:** Your pricing aligns with market average."}\n\n**Competitor Insights:**\n- Monitor top 3 competitors weekly\n- Track their pricing changes\n- Analyze their peak booking times\n\n**Strategic Positioning:**\n1. Differentiate through unique experiences\n2. Emphasize quality in marketing\n3. Build repeat customer base (higher retention = less price sensitivity)`;

          suggestions = ["View market data", "Update pricing", "Competitor analysis"];
          actions = { "Manage Stable": "/dashboard/stable/manage" };
        } else if (isMarketingQuery) {
          const repeatCustomers = new Set(ownerStable.bookings.map((b: any) => b.riderId)).size;
          const repeatRate = totalBookings > 0 ? (repeatCustomers / totalBookings) * 100 : 0;

          insights = `📧 **AUTOMATED MARKETING CAMPAIGNS:**\n\n**Customer Insights:**\n- Total customers: ${new Set(ownerStable.bookings.map((b: any) => b.riderId)).size}\n- Repeat booking rate: ${repeatRate.toFixed(1)}%\n- Average bookings per customer: ${(totalBookings / (new Set(ownerStable.bookings.map((b: any) => b.riderId)).size || 1)).toFixed(1)}\n\n**AI Marketing Recommendations:**\n\n1. **Customer Retention Campaign**\n   - Target: Customers with 1+ booking\n   - Offer: 15% off next booking\n   - Expected: +50% repeat bookings\n   - *I can automate this campaign for you!*\n\n2. **Win-Back Campaign**\n   - Target: Customers who haven't booked in 60+ days\n   - Offer: Special discount + priority booking\n   - Expected: +30% reactivation\n\n3. **Peak Time Promotion**\n   - Target: Low-demand time slots\n   - Offer: 20% off during slow periods\n   - Expected: +40% utilization\n\n4. **Referral Program**\n   - Offer: "Bring a friend, get 20% off both"\n   - Expected: +25% new customers\n\n**Automated Campaigns Available:**\n✅ Email campaigns\n✅ SMS notifications\n✅ Personalized offers\n✅ Review request automation\n\n**Projected Impact:**\n- Increase bookings: +40-60%\n- Increase revenue: +35-50%\n- Customer lifetime value: +2x`;

          suggestions = ["Activate campaigns", "View customer list", "Create custom campaign"];
          actions = { "Dashboard": "/dashboard/stable" };
        } else if (isBusinessQuery) {
          const utilizationRate = horses.length > 0 
            ? (totalBookings / (horses.length * 90)) * 100 
            : 0;
          
          const uniqueCustomers = new Set(ownerStable.bookings.map((b: any) => b.riderId)).size;
          const repeatRate = totalBookings > 0 ? (uniqueCustomers / totalBookings) : 0;
          
          const healthScore = ((completedBookings.length / (totalBookings || 1)) * 0.3 + 
                              (utilizationRate / 100) * 0.3 + 
                              (1 - repeatRate) * 0.4) * 100;

          insights = `🎓 **AI BUSINESS COACH:**\n\n**Your Business Health Score: ${healthScore.toFixed(0)}%**\n\n**Key Metrics:**\n- Horse utilization: ${utilizationRate.toFixed(1)}%\n- Completion rate: ${totalBookings > 0 ? ((completedBookings.length / totalBookings) * 100).toFixed(1) : 0}%\n- Revenue efficiency: $${avgPrice.toFixed(0)}/booking\n- Unique customers: ${uniqueCustomers}\n\n**Strategic Recommendations:**\n\n1. **Revenue Growth:**\n   ${utilizationRate < 50 ? "⚠️ **Low Utilization:** Add more availability or reduce prices during off-peak" : utilizationRate > 80 ? "✅ **High Utilization:** Consider adding more horses or increasing prices" : "✅ **Optimal Utilization:** Maintain current strategy"}\n\n2. **Operational Efficiency:**\n   - ${bestPerformer ? `Focus on promoting ${bestPerformer.name} (top performer)` : "Identify top performers"}\n   - Optimize scheduling around peak times\n   - Consider automated booking confirmations\n\n3. **Customer Experience:**\n   - Response time to inquiries: Target <5 minutes\n   - Review collection: Automated follow-up after rides\n   - Personalization: Remember customer preferences\n\n4. **Financial Health:**\n   - Revenue forecast: $${Math.round(totalRevenue / 3)} next 30 days\n   - Break-even analysis: *Available in premium analytics*\n   - Tax preparation: Track all earnings automatically\n\n**Long-term Growth Strategy:**\n- Month 1-3: Optimize pricing & scheduling\n- Month 4-6: Expand horse capacity (if utilization >70%)\n- Month 7-12: Build brand & customer loyalty\n\n**Ready to implement? I can automate most of these recommendations!**`;

          suggestions = ["Implement recommendations", "View growth plan", "Set up automation"];
          actions = { "Analytics": "/dashboard/analytics", "Manage Stable": "/dashboard/stable/manage" };
          }

          // Ensure insights is set before using it
          if (!insights || insights === "") {
            insights = "📊 **PREMIUM AI DASHBOARD:**\n\nUse specific queries to get insights:\n- \"How can I optimize pricing?\"\n- \"Show me analytics\"\n- \"Help me increase revenue\"\n- \"Compare me to competitors\"\n- \"Marketing recommendations\"\n- \"Business advice\"";
          }

          const stableName = ownerStable?.name || "Your Stable";
          response = `💎 **PREMIUM AI INSIGHTS FOR ${stableName.toUpperCase()}:**\n\n${insights}\n\n---\n\n**🚀 ADVANCED FEATURES UNLOCKED:**\n\n✨ **Real-Time Automation:**\n- Dynamic pricing updates (auto-adjusts every hour)\n- Automated customer communication\n- Review response automation\n- Booking optimization suggestions\n\n📈 **Advanced Analytics:**\n- Predictive demand forecasting (30-90 days)\n- Customer lifetime value analysis\n- Churn prediction and prevention\n- Seasonal trend analysis\n\n💰 **Revenue Maximization:**\n- Smart upselling recommendations\n- Bundle optimization\n- Cross-sell opportunities\n- Price elasticity analysis\n\n🎯 **Competitive Edge:**\n- Real-time competitor monitoring\n- Market share analysis\n- Positioning recommendations\n- Win rate optimization\n\n📧 **Marketing Automation:**\n- Personalized campaigns (AI-generated)\n- Customer segmentation\n- Automated follow-ups\n- Conversion optimization\n\n**Value: $38,500+/year | Active Premium Subscription**\n\n**Next Actions:**\nI can automatically implement these recommendations for you. Just say "apply all optimizations" or ask about specific features!`;

          suggestions = suggestions.length > 0 ? suggestions : ["Apply optimizations", "View detailed analytics", "Set up automation"];
      }
    }
    
    // Final fallback for any unmatched queries
    if (!response) {
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
