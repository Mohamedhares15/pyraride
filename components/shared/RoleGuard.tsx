"use client";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/types";
import { PageLoader } from "@/components/shared/Skeletons";

/**
 * Wrap any dashboard page with <RoleGuard allow={["admin"]}>...
 * Redirects to /signin if not authenticated, /dashboard if wrong role.
 */
export const RoleGuard = ({
  allow,
  children,
}: {
  allow: UserRole[];
  children: ReactNode;
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate({ to: "/signin" as any, replace: true });
      return;
    }
    if (!allow.includes(user.role)) {
      navigate({ to: "/dashboard" as any, replace: true });
    }
  }, [user, isLoading, allow, navigate]);

  if (isLoading || !user) {
    return <PageLoader label="Verifying access" variant="dashboard" />;
  }
  if (!allow.includes(user.role)) return null;
  return <>{children}</>;
};

export default RoleGuard;
