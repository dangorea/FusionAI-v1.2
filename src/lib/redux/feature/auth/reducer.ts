import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTH_REDUCER_NAME } from '../../reducer-constant';
import { AuthEntity } from './types';

const initialState: AuthEntity = {
  token: null,
};

const authSlice = createSlice({
  name: AUTH_REDUCER_NAME,
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
