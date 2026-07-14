'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardTopbar } from '@/components/dashboard/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const redirectedRef = useRef(false);

  // Read auth state once after mount — avoids SSR mismatch and render loops
  useEffect(() => {
    // Zustand persist rehydrates on first render; wait one tick for it
    const timer = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();
      const token = localStorage.getItem('accessToken');

      if (!isAuthenticated && !token) {
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          router.replace('/login');
        }
        return;
      }

      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Blank screen during auth check — same HTML as server so no hydration mismatch
  if (!ready) {
    return (
      <div
        className="flex h-screen bg-slate-950"
        suppressHydrationWarning
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
