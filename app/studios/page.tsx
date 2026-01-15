import { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Studios - Coming Soon - PyraRide",
  description: "Professional photography studios for your pyramid riding experience.",
};

export default function StudiosPage() {
  return (
    <div className="min-h-screen bg-background safe-area-white">
      {/* Hero with Background */}
      <div 
        className="relative h-[600px] overflow-hidden"
        style={{
          backgroundImage: "url(https://images.pexels.com/photos/2279791/pexels-photo-2279791.jpeg?auto=compress&cs=tinysrgb&w=1600)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-6xl font-bold tracking-tight text-white md:text-7xl drop-shadow-lg">
              Photography Studios
            </h1>
            <p className="mt-6 text-3xl text-white/90 drop-shadow-md">
              Coming Soon
            </p>
            <p className="mt-4 text-xl text-white/80 drop-shadow-md max-w-2xl">
              Professional photographers for your pyramid adventure
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <Card className="p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Photography Services</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            We&apos;re building a network of professional photographers who specialize in capturing
            unforgettable moments at the pyramids. Check back soon to book your photography session!
          </p>
          <div className="mt-12 space-y-4 text-left">
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 font-semibold">What&apos;s Coming:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Professional photographers</li>
                <li>✓ Sunrise & sunset shoots</li>
                <li>✓ Action shots and portraits</li>
                <li>✓ 4K video production</li>
                <li>✓ Photo editing services</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
