import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';
import { Logger } from '../../utils/Logger';
import { extractErrorInfo } from '../../utils/helpers';

export interface QueryParams {
  [key: string]: unknown;
}

export default class RestApiService {
  static baseURL: string = '';

  static defaultHeaders = {
    headers: {
      Accept: 'application/json',
    },
  };

  static defaultTimeout = 10000; // Default timeout of 10 seconds

  api: AxiosInstance;

  constructor(baseURL: string) {
    RestApiService.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      ...RestApiService.defaultHeaders,
      timeout: RestApiService.defaultTimeout,
    });

    this.api.interceptors.request.use(
      (config) => {
        Logger.info(
          `Starting Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        Logger.error('Request Error:', error);
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use((response) => {
      Logger.info(`Response: ${response.status} ${response.config.url}`);
      return response;
    });
  }

  /**
   * Constructs query parameters by filtering out undefined, null, and empty string values.
   * Serializes any object values to JSON strings.
   * @param queryParams The original query parameters.
   * @returns The filtered and serialized query parameters as an object.
   */
  public constructQueryParams(queryParams: QueryParams): QueryParams {
    const result: QueryParams = {};

    Object.entries(queryParams)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      )
      .forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = value;
        }
      });

    return result;
  }

  /**
   * Generates authentication headers with the provided token.
   * @param token The authentication token.
   * @param extraHeaders
   * @returns Partial Axios request configuration with headers.
   */
  public getAuthenticateHeader(
    token: string,
    extraHeaders?: Record<string, string>,
  ): Partial<AxiosRequestConfig> {
    return {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      },
    };
  }

  /**
   * Sends a GET request with optional query parameters.
   * @param url The endpoint URL.
   * @param params Optional query parameters.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  public async get<R>(
    url: string,
    params?: QueryParams,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const processedParams = this.constructQueryParams(params || {});
    const finalConfig: AxiosRequestConfig = {
      ...config,
      params: processedParams,
    };
    return this.request('get', url, undefined, finalConfig);
  }

  /**
   * Sends a POST request with data and optional query parameters.
   * @param url The endpoint URL.
   * @param data The request payload.
   * @param params Optional query parameters.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  public async post<T, R>(
    url: string,
    data?: T,
    params?: QueryParams,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const processedParams = this.constructQueryParams(params || {});
    const finalConfig: AxiosRequestConfig = {
      ...config,
      params: processedParams,
      headers: {
        ...RestApiService.defaultHeaders.headers, // Use default headers
        ...(config?.headers || {}), // Merge with any headers passed in config
      },
    };
    return this.request('post', url, data, finalConfig);
  }

  /**
   * Sends a PUT request with data and optional query parameters.
   * @param url The endpoint URL.
   * @param data The request payload.
   * @param params Optional query parameters.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  public async put<T, R>(
    url: string,
    data?: T,
    params?: QueryParams,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const processedParams = this.constructQueryParams(params || {});
    const finalConfig: AxiosRequestConfig = {
      ...config,
      params: processedParams,
    };
    return this.request('put', url, data, finalConfig);
  }

  /**
   * Sends a PATCH request with data and optional query parameters.
   * @param url The endpoint URL.
   * @param data The request payload.
   * @param params Optional query parameters.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  public async patch<T, R>(
    url: string,
    data?: T,
    params?: QueryParams,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const processedParams = this.constructQueryParams(params || {});
    const finalConfig: AxiosRequestConfig = {
      ...config,
      params: processedParams,
    };
    return this.request('patch', url, data, finalConfig);
  }

  /**
   * Sends a DELETE request with optional data and query parameters.
   * @param url The endpoint URL.
   * @param data Optional request payload.
   * @param params Optional query parameters.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  public async delete<T, R>(
    url: string,
    data?: T,
    params?: QueryParams,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const processedParams = this.constructQueryParams(params || {});
    const finalConfig: AxiosRequestConfig = {
      ...config,
      params: processedParams,
    };
    return this.request('delete', url, data, finalConfig);
  }

  /**
   * Handles and logs errors from Axios requests.
   * @param error The Axios error.
   */
  private handleError(error: AxiosError) {
    const safeStringify = (obj: unknown): string => {
      const cache = new Set();
      const str = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      });
      cache.clear();
      return str;
    };

    const errorInfo = extractErrorInfo(error);

    const compactError = safeStringify(errorInfo);

    Logger.error(compactError);
  }

  /**
   * General request handler that sends HTTP requests using Axios.
   * @param method The HTTP method.
   * @param url The endpoint URL.
   * @param data Optional request payload.
   * @param config Optional Axios request configuration.
   * @returns Axios response.
   */
  private async request<T, R>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: T,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<AxiosResponse<R>> {
    const payload = method === 'get' ? { params: data } : { data };

    // Clone the headers to avoid mutating the original config
    const headers = {
      ...this.api.defaults.headers.common,
      ...(config?.headers || {}),
    };

    // Check if the data is an instance of FormData
    if (data instanceof FormData) {
      // Remove the 'Content-Type' header to let Axios set it automatically
      delete headers['Content-Type'];
    }

    try {
      return await this.api.request<R>({
        method,
        url,
        ...(payload as T),
        ...config,
        headers,
      });
    } catch (error) {
      this.handleError(error as AxiosError);
      return {
        data: null,
        status: (error as AxiosError).response?.status || 500,
        statusText:
          (error as AxiosError).response?.statusText || 'Internal Server Error',
        headers: (error as AxiosError).response?.headers || {},
        config: (error as AxiosError).config,
        request: (error as AxiosError).request,
      } as AxiosResponse<R>;
    }
  }
}
