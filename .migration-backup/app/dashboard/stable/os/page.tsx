import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StableOSClient from "@/components/stable-os/StableOSClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stable OS | PyraRides",
  description: "Manage your stable operations",
};

export default async function StableOSPage() {
  const session = await getServerSession();

  if (!session?.user?.id || (session.user.role !== "stable_owner" && session.user.role !== "admin")) {
    redirect("/signin");
  }

  // Get the stable owned by this user
  const stable = await prisma.stable.findFirst({
    where: { ownerId: session.user.id, status: "approved" },
    select: { id: true },
  });

  if (!stable) {
    redirect("/dashboard/stable");
  }

  return <StableOSClient stableId={stable.id} />;
}
