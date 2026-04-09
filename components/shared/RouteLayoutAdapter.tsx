'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RouteLayoutAdapter({
  driverContent,
  consumerContent,
}: {
  driverContent: React.ReactNode;
  consumerContent: React.ReactNode;
}) {
  const pathname = usePathname();
  // Safe default for SSR static generation
  const isDriver = pathname?.startsWith('/dashboard/driver');

  // We sync the html classes on mount and updates
  useEffect(() => {
    if (isDriver) {
      document.documentElement.classList.add('dark', 'bg-black');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark', 'bg-black');
      document.documentElement.classList.add('light');
    }
  }, [isDriver]);

  return isDriver ? <>{driverContent}</> : <>{consumerContent}</>;
}
