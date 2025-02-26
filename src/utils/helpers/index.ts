import type { AxiosError } from 'axios';

export function extractErrorInfo(error: AxiosError) {
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    };
  }
  if (error.request) {
    return {
      request: error.request,
    };
  }
  return {
    message: error.message,
  };
}
