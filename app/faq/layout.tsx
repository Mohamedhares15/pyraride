import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - PyraRide",
  description: "Find answers to common questions about booking horse rides at the Giza and Saqqara Pyramids.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

