import axios from 'axios';

export const BASE_URL = window.env?.BASE_URL;
const instance = axios.create({
  baseURL: BASE_URL,
});

export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

// Request interceptor (unchanged)
instance.interceptors.request.use(
  (config) => {
    console.log('[axiosInstance] Request config before sending:', config);
    return config;
  },
  (error) => {
    console.error('[axiosInstance] Request error:', error);
    return Promise.reject(error);
  },
);

// --- Refresh Token Mechanism Setup ---

// Variables to manage token refresh state and queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(
        '[axiosInstance] 401 error detected. Starting refresh process...',
      );

      // If a refresh is already in progress, queue this request.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error('[axiosInstance] No refresh token available.');
        // No refresh token; clear tokens and redirect to login.
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const tokenUrl = `https://${window.env.AUTH0_DOMAIN}/oauth/token`;
        const body = {
          grant_type: 'refresh_token',
          client_id: window.env.AUTH0_CLIENT_ID,
          refresh_token: refreshToken,
        };
        console.log('[axiosInstance] Attempting to refresh token...');
        // Use the global axios instance (without our interceptors) to avoid loops.
        const response = await axios.post(tokenUrl, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        const tokenData = response.data;
        console.log('[axiosInstance] Token refreshed successfully:', tokenData);

        // Update tokens in localStorage and axios instance.
        localStorage.setItem('access_token', tokenData.access_token);
        if (tokenData.id_token) {
          localStorage.setItem('id_token', tokenData.id_token);
          setAuthToken(tokenData.id_token);
        } else {
          setAuthToken(tokenData.access_token);
        }

        processQueue(null, tokenData.access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization =
            'Bearer ' + tokenData.access_token;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('[axiosInstance] Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        // Clear stored tokens and redirect to login.
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
