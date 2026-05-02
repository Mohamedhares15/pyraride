import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import StablesClient from "@/pages/stables/StablesClient";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function StablesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" /></div>}>
        <StablesClient />
      </Suspense>
      <Footer />
    </div>
  );
}
