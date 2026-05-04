import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import RiderDashboard from "@/pages/dashboards/RiderDashboard";
import { PageLoader } from "@/components/shared/Skeletons";

const ROLE_TO_PATH: Record<string, string> = {
  admin: "/dashboard/admin",
  stable_owner: "/dashboard/stable",
  captain: "/dashboard/captain",
  driver: "/dashboard/driver",
  cx_media: "/dashboard/cx-media",
};

const DashboardRouter = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate({ to: "/signin" as any, replace: true });
      return;
    }
    const target = ROLE_TO_PATH[user.role];
    if (target) navigate({ to: target as any, replace: true });
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <PageLoader label="Preparing your dashboard" variant="dashboard" />;
  }

  if (user.role === "rider") return <RiderDashboard />;
  return <PageLoader label="Routing" variant="dashboard" />;
};

export default DashboardRouter;
