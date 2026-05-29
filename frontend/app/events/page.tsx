'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/events');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600 text-lg">Redirecting to Events Dashboard...</p>
      </div>
    </div>
  );
}
