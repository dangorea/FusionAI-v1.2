import axios from 'axios';

export const BASE_URL = window.env?.BASE_URL;
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const setAuthToken = (token: string) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[axiosInstance] Request config before sending:', config);
    return config;
  },
  (error) => {
    console.error('[axiosInstance] Request error:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
