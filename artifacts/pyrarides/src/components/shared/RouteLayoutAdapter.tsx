'use client';

import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function RouteLayoutAdapter({
  driverContent,
  consumerContent,
}: {
  driverContent: React.ReactNode;
  consumerContent: React.ReactNode;
}) {
  const [pathname] = useLocation();
  const isDriver = pathname?.startsWith('/dashboard/driver');

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
