import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | PyraRide - Horse Riding at Pyramids",
  description: "Find answers to common questions about booking horse riding at Giza and Saqqara Pyramids. Learn about pricing, safety, cancellation policies, and what to expect.",
  keywords: [
    "PyraRide FAQ",
    "horse riding Egypt questions",
    "booking horse riding pyramids",
    "horse riding safety Egypt",
    "PyraRide cancellation policy",
    "horse riding prices Giza",
    "best time for horse riding pyramids"
  ],
  openGraph: {
    title: "Frequently Asked Questions | PyraRide",
    description: "Everything you need to know about booking your horse riding experience at the Pyramids. Safety, pricing, and more.",
    url: "https://www.pyrarides.com/faq",
    type: "website",
    images: [
      {
        url: "https://www.pyrarides.com/og-faq.jpg",
        width: 1200,
        height: 630,
        alt: "PyraRide FAQ - Horse Riding at the Pyramids",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PyraRide FAQ - Your Questions Answered",
    description: "Everything you need to know about booking your horse riding experience at the Pyramids.",
    images: ["https://www.pyrarides.com/og-faq.jpg"],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

