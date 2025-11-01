import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jennifer Martinez",
      country: "USA",
      rating: 5,
      date: "October 2025",
      review: "Absolutely magical experience! The horses were well-cared for, the guide was knowledgeable, and riding near the Pyramids at sunset was a dream come true. PyraRide made booking so easy and transparent.",
      verified: true,
    },
    {
      name: "James Anderson",
      country: "UK",
      rating: 5,
      date: "September 2025",
      review: "Best part of our Egypt trip! The stable was exactly as described, the horse (Luna) was gentle and beautiful, and the whole experience felt safe and professional. Highly recommend PyraRide!",
      verified: true,
    },
    {
      name: "Sophie Laurent",
      country: "France",
      rating: 5,
      date: "October 2025",
      review: "J'ai adoré! The booking process was seamless, customer service responded within an hour, and the ride exceeded our expectations. The photos are incredible. Worth every penny!",
      verified: true,
    },
    {
      name: "Michael Chen",
      country: "Singapore",
      rating: 5,
      date: "August 2025",
      review: "As someone who had never ridden before, I was nervous. But the staff was patient, the horse was calm, and PyraRide's detailed information helped me prepare perfectly. Five stars!",
      verified: true,
    },
    {
      name: "Emma Thompson",
      country: "Australia",
      rating: 5,
      date: "September 2025",
      review: "Incredible value for money! Clear pricing, no hidden fees, professional service, and an unforgettable experience. The cancellation policy is fair, and communication was excellent throughout.",
      verified: true,
    },
    {
      name: "Carlos Rodriguez",
      country: "Spain",
      rating: 5,
      date: "October 2025",
      review: "We booked for our family of 5. PyraRide made group booking easy, matched us with perfect horses for each person's level, and the whole experience was flawless. Will definitely return!",
      verified: true,
    },
  ];

  return (
    <div className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Riders Say
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Real reviews from verified riders who've experienced the magic
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current" />
            ))}
            <span className="ml-2 text-lg font-bold text-foreground">4.9/5</span>
            <span className="text-sm text-muted-foreground">(2,500+ reviews)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Review */}
                <div className="relative">
                  <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                  <p className="text-sm text-muted-foreground italic mb-4 pl-6">
                    "{testimonial.review}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.country} • {testimonial.date}</p>
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>
                      </div>
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TripAdvisor Link */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            See more reviews on TripAdvisor
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Star className="h-4 w-4 fill-white text-white" />
                </div>
              ))}
            </div>
            <span className="font-bold text-lg">4.9/5</span>
            <span className="text-sm text-muted-foreground">on TripAdvisor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

