import { Shield, Award, CheckCircle, Star } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Verified & Secure",
      description: "SSL encrypted platform with verified payment processing",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Featured on TripAdvisor's Top Egyptian Experiences 2024",
      color: "text-yellow-600"
    },
    {
      icon: Star,
      title: "4.9/5 Rating",
      description: "Based on 2,500+ verified customer reviews",
      color: "text-orange-600"
    },
    {
      icon: CheckCircle,
      title: "Safety Certified",
      description: "All stables meet international safety & welfare standards",
      color: "text-green-600"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div
            key={idx}
            className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50 border hover:border-primary transition-all hover:shadow-lg"
          >
            <div className={`p-3 rounded-full bg-background mb-3`}>
              <Icon className={`h-8 w-8 ${badge.color}`} />
            </div>
            <h3 className="font-bold text-sm mb-1">{badge.title}</h3>
            <p className="text-xs text-muted-foreground">
              {badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
