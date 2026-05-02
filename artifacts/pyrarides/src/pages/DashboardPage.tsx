import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        const role = data?.user?.role;
        if (!role) {
          navigate("/signin");
          return;
        }
        if (role === "rider") navigate("/dashboard/rider");
        else if (role === "stable_owner") navigate("/dashboard/stable");
        else if (role === "captain") navigate("/dashboard/captain");
        else if (role === "admin") navigate("/dashboard/analytics");
        else navigate("/dashboard/rider");
      })
      .catch(() => navigate("/signin"))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black/95">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}
