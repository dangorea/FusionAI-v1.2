import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import apiClient from '../../../services/api';

export const axiosTokenMiddleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);

    const { token } = (store.getState() as RootState).auth;
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }

    return result;
  };
