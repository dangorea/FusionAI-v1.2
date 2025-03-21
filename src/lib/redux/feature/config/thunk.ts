import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProvider } from '../../../../api/code-generations';
import type { LLMProvider } from '../../../../types/common';

export const fetchProviders = createAsyncThunk<
  LLMProvider[],
  void,
  { rejectValue: string }
>('config/fetchProviders', async (_, { rejectWithValue }) => {
  try {
    const providers = await getProvider();
    return providers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch providers');
  }
});
