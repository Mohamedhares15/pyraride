import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pyrarides.com"),
};

// Minimal isolated layout — no header, no footer, no navigation.
// Used for shareable stable links at pyrarides.com/[stable-name]
export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-background`}>
        <AuthProvider>
          <main id="main-content">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
