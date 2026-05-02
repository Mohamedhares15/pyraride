import { useState, useEffect } from "react";
import { useParams } from "wouter";
import PackageCheckoutClient from "./PackageCheckoutClient";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Loader2 } from "lucide-react";

export default function PackageCheckoutPage() {
  const params = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/packages/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setPkg(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !pkg) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Package Not Found</h1>
          <p className="text-white/60">This package does not exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
      <Navbar />
      <main className="pt-24 pb-32 container mx-auto px-4 max-w-6xl">
        <PackageCheckoutClient pkg={pkg} />
      </main>
      <Footer />
    </div>
  );
}
