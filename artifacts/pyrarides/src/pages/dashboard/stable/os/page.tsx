import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import StableOSClient from "@/components/stable-os/StableOSClient";
import { Loader2 } from "lucide-react";

export default function StableOSPage() {
  const [, navigate] = useLocation();
  const [stableId, setStableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.ok ? r.json() : null)
      .then((session) => {
        if (!session?.user?.id) {
          navigate("/signin");
          return;
        }
        const role = session.user.role;
        if (role !== "stable_owner" && role !== "admin") {
          navigate("/dashboard");
          return;
        }
        return fetch("/api/my-stable");
      })
      .then((r) => {
        if (!r) return;
        if (r.ok) return r.json();
        navigate("/dashboard/stable");
      })
      .then((data) => {
        if (data?.id) {
          setStableId(data.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!stableId) return null;

  return <StableOSClient stableId={stableId} />;
}
