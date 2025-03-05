import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { setAuthToken } from '../../../services/api';

export const axiosTokenMiddleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);

    const { token } = (store.getState() as RootState).auth;
    if (token) {
      setAuthToken(token);
    }

    return result;
  };
