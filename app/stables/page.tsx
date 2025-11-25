import { Suspense } from "react";
import { Metadata } from "next";
import StablesClient from "./StablesClient";
import { Loader2 } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Browse Stables in Giza and Saqqara | PyraRide",
    description: "Find trusted horse stables in Giza and Saqqara. Book your unforgettable riding experience at the pyramids with verified reviews and safety certifications.",
    keywords: ["horse stables", "Giza", "Saqqara", "pyramids", "horse riding", "Egypt", "tourist attractions"],
    alternates: {
      canonical: "https://www.pyrarides.com/stables",
    },
    openGraph: {
      title: "Browse Stables in Giza and Saqqara",
      description: "Find trusted horse stables in Giza and Saqqara",
      type: "website",
      url: "https://www.pyrarides.com/stables",
    },
    twitter: {
      card: "summary_large_image",
      title: "Browse Stables in Giza and Saqqara",
      description: "Find trusted horse stables in Giza and Saqqara",
    },
  };
}

export const dynamic = "force-dynamic";

export default function StablesPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="sr-only">Loading stables...</span>
        </div>
      }
    >
      <StablesClient />
    </Suspense>
  );
}
