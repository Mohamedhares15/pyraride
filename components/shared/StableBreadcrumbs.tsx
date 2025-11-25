"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

interface StableBreadcrumbsProps {
  stableName: string;
  stableId: string;
}

export default function StableBreadcrumbs({ stableName, stableId }: StableBreadcrumbsProps) {
  const baseUrl = "https://www.pyrarides.com";
  
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Stables", url: `${baseUrl}/stables` },
    { name: stableName, url: `${baseUrl}/stables/${stableId}` },
  ];

  return (
    <>
      {/* Structured Data for Breadcrumbs */}
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  href={item.url}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  aria-label="Home"
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-foreground font-medium" aria-current="page">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

