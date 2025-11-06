import { Card } from "@/components/ui/card";
import { Search, Calendar, CheckCircle, Smile } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Search,
      title: "Browse & Compare",
      description: "Explore verified stables in Giza and Saqqara. Compare prices, read reviews, and see real photos of horses and facilities."
    },
    {
      number: "2",
      icon: Calendar,
      title: "Select & Book",
      description: "Choose your preferred horse, date, and time. See real-time availability and get instant confirmation with all details."
    },
    {
      number: "3",
      icon: CheckCircle,
      title: "Receive Confirmation",
      description: "Get your booking confirmed via email with exact location, directions, and everything you need to know before your ride."
    },
    {
      number: "4",
      icon: Smile,
      title: "Enjoy Your Adventure",
      description: "Arrive 15 minutes early, meet your guide and horse, and experience the pyramids on horseback. Create memories that last forever!"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From browsing to riding in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                <Card className="p-6 h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-6 mt-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>

                {/* Connector Arrow (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 -right-4 transform translate-x-1/2 z-10">
                    <svg className="w-8 h-8 text-primary/30" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/stables"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Start Browsing Stables
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free cancellation up to 48h before
          </p>
        </div>
      </div>
    </section>
  );
}
