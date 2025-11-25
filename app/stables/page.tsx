import { Suspense } from "react";
import { Metadata } from "next";
import StablesClient from "./StablesClient";
import { Loader2 } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Browse 20+ Horse Riding Stables at Giza & Saqqara | PyraRide",
    description: "Compare and book from 20+ verified horse riding stables at Giza and Saqqara Pyramids. Read reviews, compare prices, instant booking. Egypt's #1 horse riding marketplace at www.pyrarides.com.",
    keywords: [
      "horse stables Egypt",
      "Giza horse riding stables",
      "Saqqara horse riding",
      "compare horse riding stables",
      "horse riding marketplace Egypt",
      "pyramid horse stables",
      "horse stables",
      "Giza",
      "Saqqara",
      "pyramids",
      "horse riding",
      "Egypt",
      "tourist attractions",
      "book horse riding online",
      "horse riding platform Egypt"
    ],
    alternates: {
      canonical: "https://www.pyrarides.com/stables",
    },
    openGraph: {
      title: "Browse 20+ Horse Riding Stables at Giza & Saqqara | PyraRide",
      description: "Compare and book from 20+ verified horse riding stables. Egypt's #1 marketplace for pyramid horse riding experiences.",
      type: "website",
      url: "https://www.pyrarides.com/stables",
    },
    twitter: {
      card: "summary_large_image",
      title: "Browse 20+ Horse Riding Stables at Giza & Saqqara",
      description: "Compare and book from 20+ verified stables. Egypt's #1 marketplace for pyramid horse riding.",
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
