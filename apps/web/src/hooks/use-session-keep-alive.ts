'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Proactively refresh the access token every 7 hours (1 hour before 8h expiry).
// This prevents the user from ever seeing a 401 during normal usage.
const REFRESH_INTERVAL_MS = 7 * 60 * 60 * 1000; // 7 hours

function setAccessCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 30 * 24 * 3600;
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function useSessionKeepAlive() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = (delayMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doRefresh, delayMs);
  };

  const doRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return; // not logged in, nothing to do

      const response: any = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
          timeout: 15_000,
        },
      );

      const tokens =
        response.data?.data?.tokens ??
        response.data?.tokens ??
        response.data?.data ??
        {};
      const newAccessToken = tokens.accessToken;
      if (!newAccessToken) return;

      localStorage.setItem('accessToken', newAccessToken);
      setAccessCookie(newAccessToken);

      // Update Zustand store in-place
      try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.state) {
            parsed.state.accessToken = newAccessToken;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
        }
      } catch { /* ignore */ }

      // Schedule the next refresh
      scheduleRefresh(REFRESH_INTERVAL_MS);
    } catch {
      // Silent failure — the response interceptor will handle actual 401s
    }
  };

  useEffect(() => {
    // Only run if there's actually a logged-in session
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('refreshToken');
    if (!token) return;

    // Schedule first refresh after the interval
    scheduleRefresh(REFRESH_INTERVAL_MS);

    // Also refresh when the tab regains focus after being hidden > 30 min
    let hiddenAt: number | null = null;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenAt) {
        const hiddenMs = Date.now() - hiddenAt;
        hiddenAt = null;
        // If the tab was hidden for more than 30 minutes, refresh immediately
        if (hiddenMs > 30 * 60 * 1000) {
          doRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
