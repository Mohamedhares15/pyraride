import { useState, useEffect } from "react";
import { useParams } from "wouter";
import StableDetailsClient from "@/components/stables/StableDetailsClient";
import { Loader2 } from "lucide-react";

export default function StablePage() {
  const params = useParams<{ id: string }>();
  const [stable, setStable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/stables/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setStable(data);
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

  if (notFound || !stable) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Stable Not Found</h1>
          <p className="text-white/60">This stable does not exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  return <StableDetailsClient initialStable={stable} />;
}
