'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useSessionKeepAlive } from '@/hooks/use-session-keep-alive';

// Inner component so the hook can use the React tree context
function SessionGuard({ children }: { children: React.ReactNode }) {
  useSessionKeepAlive();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SessionGuard>
          {children}
        </SessionGuard>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
