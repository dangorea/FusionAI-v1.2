import axios from 'axios';

export const BASE_URL = window.env?.BASE_URL;
const instance = axios.create({
  baseURL: BASE_URL,
});

// Helper to set or remove the Authorization header
export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
};

// Initialize Axios with the saved access token (if available)
const savedAccessToken = localStorage.getItem('access_token');
if (savedAccessToken) {
  setAuthToken(savedAccessToken);
}

let isRefreshing = false;
let failedQueue: any = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Calls Auth0 token endpoint using the refresh token grant.
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokenUrl = `https://${window.env.AUTH0_DOMAIN}/oauth/token`;
  const body = {
    grant_type: 'refresh_token',
    client_id: window.env.AUTH0_CLIENT_ID,
    refresh_token: refreshToken,
    audience: window.env.AUTH0_AUDIENCE,
  };

  // Make sure to use axios (or fetch) directly here (without interceptors) to avoid loops.
  const response = await axios.post(tokenUrl, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

instance.interceptors.request.use(
  (config) => {
    // If a token refresh is already happening, queue this request until it completes.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(config);
          },
          reject,
        });
      });
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        // Queue the request if a refresh is already in progress.
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }
      isRefreshing = true;
      try {
        const tokenData = await refreshAccessToken();

        // Update tokens in localStorage.
        // (If Auth0 returns a new refresh token, update it as well.)
        localStorage.setItem('access_token', tokenData.access_token);
        if (tokenData.id_token) {
          localStorage.setItem('id_token', tokenData.id_token);
        }
        if (tokenData.refresh_token) {
          localStorage.setItem('refresh_token', tokenData.refresh_token);
        }
        setAuthToken(tokenData.access_token);
        processQueue(null, tokenData.access_token);
        originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
