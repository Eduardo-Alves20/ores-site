import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
});

// ── Auth state ───────────────────────────────────────────────────────────────
let accessToken = null;
let refreshPromise = null;

export function setAccessToken(t) { accessToken = t; }
export function clearAccessToken() { accessToken = null; }

// ── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = api.post('/admin/auth/refresh')
          .then((r) => { setAccessToken(r.data.accessToken); return r.data.accessToken; })
          .catch(() => { clearAccessToken(); window.location.href = '/admin/login'; })
          .finally(() => { refreshPromise = null; });
      }
      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
