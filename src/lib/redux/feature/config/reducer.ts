import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ConfigState } from './types';
import { CONFIG_REDUCER_NAME } from '../../reducer-constant';
import { fetchProviders } from './thunk';

const initialState: ConfigState = {
  provider: {
    options: [],
    selectedProvider: null,
  },
};

export const config = createSlice({
  name: CONFIG_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedProvider: (state, action: PayloadAction<string | null>) => {
      state.provider.selectedProvider = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProviders.fulfilled, (state, action) => {
      state.provider.options = action.payload;

      if (!state.provider.selectedProvider) {
        state.provider.selectedProvider = action.payload[3].id;
      }
    });
  },
});

export const { setSelectedProvider } = config.actions;
export default config.reducer;
