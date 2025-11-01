import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Horse, Star } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      number: "1",
      title: "Browse & Compare",
      description: "Explore verified stables in Giza and Saqqara. Filter by location, rating, price, and availability. Read authentic reviews from real riders.",
    },
    {
      icon: Calendar,
      number: "2",
      title: "Book Your Ride",
      description: "Select your preferred date, time, and horse. Secure payment with instant confirmation. Receive detailed booking info via email.",
    },
    {
      icon: Horse,
      number: "3",
      title: "Experience the Magic",
      description: "Arrive at the stable, meet your horse, and embark on an unforgettable adventure around the Pyramids with expert guides.",
    },
    {
      icon: Star,
      number: "4",
      title: "Share Your Story",
      description: "Leave a review to help future riders. Your feedback helps us maintain the highest quality standards across all partner stables.",
    },
  ];

  return (
    <div className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From browsing to riding in 4 simple steps. It's that easy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8 text-center">
                  {/* Step Number Badge */}
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>

                {/* Connector Arrow */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="h-6 w-6 rotate-45 bg-background border-r border-t border-border"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Trust Message */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 inline-block">
            <CardContent className="pt-6 pb-6 px-8">
              <p className="font-semibold mb-2">100% Satisfaction Guaranteed</p>
              <p className="text-sm text-muted-foreground">
                If you're not completely satisfied with your experience, we'll make it right or refund your money.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

