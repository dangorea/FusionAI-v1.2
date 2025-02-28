import axios, { AxiosInstance } from 'axios';
import {
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
} from '@auth0/auth0-spa-js';

const apiClient: AxiosInstance = axios.create({
  baseURL: window.env.BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export const setupAxiosInterceptors = (getTokenFunction: {
  (
    options: GetTokenSilentlyOptions & { detailedResponse: true },
  ): Promise<GetTokenSilentlyVerboseResponse>;
  (options?: GetTokenSilentlyOptions): Promise<string>;
  (
    options: GetTokenSilentlyOptions,
  ): Promise<GetTokenSilentlyVerboseResponse | string>;
}) => {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        // Handle token errors, e.g. redirect to login
        return Promise.reject(error);
      }
    },
    (error) => Promise.reject(error),
  );
};

export default apiClient;
