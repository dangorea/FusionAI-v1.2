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

      // If no provider has been selected yet, use the default provider from the options
      if (!state.provider.selectedProvider) {
        const defaultProvider = action.payload.find(
          (provider) => provider.default,
        );
        if (defaultProvider) {
          state.provider.selectedProvider = defaultProvider.id;
        } else if (action.payload.length > 0) {
          state.provider.selectedProvider = action.payload[0].id;
        }
      }
    });
  },
});

export const { setSelectedProvider } = config.actions;
export default config.reducer;
