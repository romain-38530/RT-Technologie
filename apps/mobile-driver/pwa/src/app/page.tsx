'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = storage.getToken();
    const currentMission = storage.getCurrentMission();

    if (token && currentMission) {
      // Redirect to mission tracking
      router.push('/mission/tracking');
    } else if (token) {
      // Redirect to mission selection
      router.push('/mission/dashboard');
    } else {
      // Redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-driver text-rt-gray">Chargement...</p>
      </div>
    </div>
  );
}
