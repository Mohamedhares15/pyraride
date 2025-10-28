import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import AIAgent from "@/components/shared/AIAgent";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PyraRide - Book Your Trusted Giza Horse Riding Experience",
  description: "The Pyramids, Unforgettable. The Ride, Uncomplicated.",
  keywords: ["horse riding", "Giza", "Saqqara", "Egypt", "tourism", "pyramids"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <AIAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
