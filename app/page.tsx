import Hero from "@/components/sections/Hero";
import Navbar from "@/components/shared/Navbar";
import ComingSoon from "@/components/shared/ComingSoon";

export default function HomePage() {
  return (
    <ComingSoon>
      <Navbar />
      <Hero />
    </ComingSoon>
  );
}
