import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import AIAgent from "@/components/shared/AIAgent";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PyraRide - Book Your Trusted Giza Horse Riding Experience",
    template: "%s | PyraRide",
  },
  description: "Book your trusted, vetted ride at the Giza and Saqqara Pyramids",
  keywords: ["horse riding", "Giza", "Saqqara", "Egypt", "tourism", "pyramids"],
  metadataBase: new URL("https://www.pyrarides.com"),
  openGraph: {
    type: "website",
  },
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isRTL = locale === "ar";
  
  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <AIAgent />
        </AuthProvider>
      </body>
    </html>
  );
}

