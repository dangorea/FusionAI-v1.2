import axios from 'axios';

export const BASE_URL = window.env?.BASE_URL;
const instance = axios.create({
  baseURL: BASE_URL,
});

export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
};

const savedAccessToken = localStorage.getItem('access_token');
if (savedAccessToken) {
  setAuthToken(savedAccessToken);
}

let isRenewing = false;
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

instance.interceptors.request.use(
  (config) => {
    if (isRenewing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(config);
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }

    console.log('[axiosInstance] Request config before sending:', config);
    return config;
  },
  (error) => {
    console.error('[axiosInstance] Request error:', error);
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(
        '[axiosInstance] 401 detected. Attempting silent refresh...',
      );
      originalRequest._retry = true;

      if (isRenewing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: unknown) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRenewing = true;

      try {
        const redirectUri = 'fusionai://auth/callback';
        const silentAuthUrl =
          `https://${window.env.AUTH0_DOMAIN}/authorize?` +
          `response_type=code&` +
          `client_id=${window.env.AUTH0_CLIENT_ID}&` +
          `audience=${window.env.AUTH0_AUDIENCE}&` +
          `scope=${encodeURIComponent('openid profile email create:projects offline_access')}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `prompt=none`;

        const code = await window.electron.ipcRenderer.invoke(
          'silentTokenRenew',
          silentAuthUrl,
        );

        const tokenUrl = `https://${window.env.AUTH0_DOMAIN}/oauth/token`;
        const body = {
          grant_type: 'authorization_code',
          client_id: window.env.AUTH0_CLIENT_ID,
          code,
          redirect_uri: redirectUri,
          audience: window.env.AUTH0_AUDIENCE,
        };
        const tokenResponse = await axios.post(tokenUrl, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        const tokenData = tokenResponse.data;
        console.log(
          '[axiosInstance] Silent authentication succeeded:',
          tokenData,
        );

        localStorage.setItem('access_token', tokenData.access_token);
        setAuthToken(tokenData.access_token);

        if (tokenData.id_token) {
          localStorage.setItem('id_token', tokenData.id_token);
        }

        processQueue(null, tokenData.access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        }

        return instance(originalRequest);
      } catch (silentError) {
        console.error(
          '[axiosInstance] Silent authentication failed:',
          silentError,
        );

        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        window.location.href = '/login';

        processQueue(silentError, null);

        return Promise.reject(silentError);
      } finally {
        isRenewing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
