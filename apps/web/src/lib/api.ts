import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Give plenty of time — scan requests can take 30s+
  timeout: 120_000,
});

// ─── Helper: set cookie with max-age (never expires= style) ──────────────────
function setAccessCookie(token: string, maxAgeDays = 30) {
  if (typeof document === 'undefined') return;
  const maxAge = maxAgeDays * 24 * 3600;
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAccessCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
}

// ─── Request interceptor – attach JWT from localStorage ───────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Queuing mechanism for concurrent 401s ────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailedSubscribers: Array<() => void> = [];

function subscribeTokenRefresh(onSuccess: (token: string) => void, onFail: () => void) {
  refreshSubscribers.push(onSuccess);
  refreshFailedSubscribers.push(onFail);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

function onRefreshFailed() {
  refreshFailedSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

// ─── Hard logout ──────────────────────────────────────────────────────────────
// Only called when BOTH access AND refresh tokens are definitively invalid.
function hardLogout() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  clearAccessCookie();

  // Clear Zustand persisted state
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state = { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch { /* ignore */ }

  // Only redirect if not already on an auth page
  const path = window.location.pathname;
  if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/forgot-password')) {
    window.location.replace('/login');
  }
}

// ─── Response interceptor – handle 401 with silent token refresh ──────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Network error (no response) — DO NOT log out, just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Non-401 errors pass through untouched
    if (status !== 401) {
      return Promise.reject(error.response?.data || error);
    }

    // 401 on the refresh endpoint itself → refresh token is expired → logout
    if (originalRequest.url?.includes('/auth/refresh')) {
      isRefreshing = false;
      onRefreshFailed();
      hardLogout();
      return Promise.reject(error.response?.data || error);
    }

    // 401 on /auth/me or /auth/logout → already logged out
    if (originalRequest.url?.includes('/auth/me') || originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error.response?.data || error);
    }

    // Already retried this request → don't loop
    if (originalRequest._retry) {
      return Promise.reject(error.response?.data || error);
    }

    // If we have no refresh token stored, logout immediately
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      hardLogout();
      return Promise.reject(error.response?.data || error);
    }

    // Another refresh is already in flight — queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          () => reject(error.response?.data || error),
        );
      });
    }

    // Start a refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response: any = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
          timeout: 15_000,
        },
      );

      // Backend wraps in TransformInterceptor: { data: { tokens: { accessToken } } }
      const tokens = response.data?.data?.tokens ?? response.data?.tokens ?? response.data?.data ?? {};
      const newAccessToken = tokens.accessToken;

      if (!newAccessToken) {
        throw new Error('Empty access token in refresh response');
      }

      // Persist new token
      localStorage.setItem('accessToken', newAccessToken);
      setAccessCookie(newAccessToken);

      // Update Zustand store without re-triggering login
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

      isRefreshing = false;
      onTokenRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshFailed();
      hardLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default api;

/* ───────── Auth ───────── */
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
};

/* ───────── Businesses ───────── */
export const businessApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/businesses', { params }),
  getById: (id: string) => api.get(`/businesses/${id}`),
  delete: (id: string) => api.delete(`/businesses/${id}`),
  getAnalysis: (id: string) => api.get(`/businesses/${id}/analysis`),
  getRecommendations: (id: string) => api.get(`/businesses/${id}/recommendations`),
  analyze: (id: string) => api.post(`/businesses/${id}/analyze`),
};

/* ───────── Search ───────── */
export const searchApi = {
  scan: (data: { state: string; city?: string; radius?: number; limit?: number }) =>
    api.post('/search/scan', data),
  search: (data: Record<string, unknown>) => api.post('/search', data),
  getHistory: (params?: Record<string, unknown>) => api.get('/search/history', { params }),
  deleteHistory: (id: string) => api.delete(`/search/history/${id}`),
};

/* ───────── Analytics ───────── */
export const analyticsApi = {
  getFull: () => api.get('/analytics'),
  getStats: () => api.get('/analytics/stats'),
  getCategories: () => api.get('/analytics/categories'),
  getOpportunities: () => api.get('/analytics/opportunities'),
  getTrends: (days?: number) => api.get('/analytics/trends', { params: { days } }),
  getTopOpportunities: (limit?: number) =>
    api.get('/analytics/top-opportunities', { params: { limit } }),
  resetAll: () => api.post('/analytics/reset'),
};

/* ───────── Export ───────── */
export const exportApi = {
  export: (data: Record<string, unknown>) =>
    api.post('/export', data, { responseType: 'blob' }),
  csv: () => api.get('/export/csv', { responseType: 'blob' }),
  excel: () => api.get('/export/excel', { responseType: 'blob' }),
  pdf: () => api.get('/export/pdf', { responseType: 'blob' }),
};

/* ───────── Profile ───────── */
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: Record<string, unknown>) => api.put('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/profile/change-password', data),
  getStats: () => api.get('/profile/stats'),
};

/* ───────── Admin ───────── */
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }),
  getAuditLogs: (params?: Record<string, unknown>) => api.get('/admin/audit-logs', { params }),
};

/* ───────── Recommendations ───────── */
export const recommendationApi = {
  getById: (id: string) => api.get(`/recommendations/${id}`),
  getByBusiness: (businessId: string) => api.get(`/recommendations/business/${businessId}`),
  markActioned: (id: string) => api.patch(`/recommendations/${id}/action`),
};
