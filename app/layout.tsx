import type { Metadata } from "next";
import "./globals.css";
import { SiteLayout } from "@/components/shared/SiteLayout";
import { Toaster } from "sonner";
import { QueryProvider } from "./_providers/query-provider";

export const metadata: Metadata = {
  title: "PyraRides — Ride at the Pyramids",
  description:
    "Egypt's first online marketplace for booking horse riding experiences at the Giza and Saqqara Pyramids.",
  themeColor: "#F5F5DC",
  openGraph: {
    title: "PyraRides — Ride at the Pyramids",
    description:
      "Book a horse and ride past the Great Pyramids. Verified stables, trained horses, modern booking.",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@pyrarides" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <QueryProvider>
          <SiteLayout>{children}</SiteLayout>
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "!bg-surface-elevated !border !border-hairline !text-foreground !rounded-sm !font-sans",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
