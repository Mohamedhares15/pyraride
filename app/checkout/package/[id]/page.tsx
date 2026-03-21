import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PackageCheckoutClient from './PackageCheckoutClient';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Checkout Package | PyraRides',
  description: 'Complete your luxury package booking.',
};

export default async function PackageCheckoutPage({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({
    where: { id: params.id, isActive: true },
  });

  if (!pkg) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
      <Navbar />
      <main className="pt-24 pb-32 container mx-auto px-4 max-w-6xl">
        <PackageCheckoutClient pkg={pkg} />
      </main>
      <Footer />
    </div>
  );
}
