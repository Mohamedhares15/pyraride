"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
    {
        id: "monthly",
        name: "Monthly Pass",
        price: 2000,
        period: "/month",
        rides: 4,
        description: "Perfect for regular riders",
        features: [
            "4 rides per month",
            "20% discount on rides",
            "Priority booking",
            "Cancel anytime",
        ],
        icon: Star,
        popular: false,
    },
    {
        id: "annual",
        name: "Annual Pass",
        price: 22000,
        period: "/year",
        rides: 48,
        description: "Best value for enthusiasts",
        features: [
            "48 rides per year (4/month)",
            "30% discount on all rides",
            "Priority booking",
            "Early access to new horses",
            "Free guest passes (2/month)",
            "Exclusive events access",
        ],
        icon: Crown,
        popular: true,
    },
    {
        id: "family",
        name: "Family Plan",
        price: 3500,
        period: "/month",
        rides: 8,
        description: "For the whole family",
        features: [
            "8 rides per month",
            "Up to 4 family members",
            "25% discount on rides",
            "Family group booking",
            "Priority support",
        ],
        icon: Zap,
        popular: false,
    },
];

export default function SubscriptionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (planId: string) => {
        if (status !== "authenticated") {
            router.push("/signin?redirect=/subscriptions");
            return;
        }

        setIsLoading(true);
        setSelectedPlan(planId);

        // In production, this would create a subscription and redirect to payment
        // For demo, we'll just show a success message
        setTimeout(() => {
            setIsLoading(false);
            alert("Subscription feature coming soon! This is a demo.");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black safe-area-black text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden py-20 px-6">
                <div className="absolute inset-0 bg-[url('/hero-bg.webp')] bg-cover bg-center opacity-20" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <Badge className="mb-4 bg-[rgb(218,165,32)]/20 text-[rgb(218,165,32)] border-[rgb(218,165,32)]/30">
                        🎉 Launch Offer - 20% Off Annual Plans
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Ride More, Pay Less
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Choose a subscription plan and enjoy exclusive perks, priority booking, and significant savings on every ride.
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <Card
                                key={plan.id}
                                className={`relative bg-white/5 border-white/10 transition-all duration-300 hover:scale-105 ${plan.popular ? "ring-2 ring-[rgb(218,165,32)]" : ""
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-[rgb(218,165,32)] text-black">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="text-center pt-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(218,165,32)]/20 flex items-center justify-center">
                                        <Icon className="h-8 w-8 text-[rgb(218,165,32)]" />
                                    </div>
                                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="text-white/60">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-white">
                                            EGP {plan.price.toLocaleString()}
                                        </span>
                                        <span className="text-white/60">{plan.period}</span>
                                    </div>

                                    {plan.rides && (
                                        <div className="mb-4 text-sm text-white/60">
                                            {plan.rides} rides included
                                        </div>
                                    )}

                                    <ul className="space-y-3 mb-6 text-left">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isLoading && selectedPlan === plan.id}
                                        className={`w-full ${plan.popular
                                            ? "bg-[rgb(218,165,32)] hover:bg-[rgb(218,165,32)]/90 text-black"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                            }`}
                                    >
                                        {isLoading && selectedPlan === plan.id
                                            ? "Processing..."
                                            : "Get Started"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="mt-16 text-center">
                    <p className="text-white/60 text-sm">
                        * Unlimited rides subject to fair use policy (max 2 rides/day).
                        <br />
                        All plans include access to all stables and horses.
                    </p>
                </div>
            </div>
        </div>
    );
}
