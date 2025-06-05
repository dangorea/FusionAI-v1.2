import { createAsyncThunk } from '@reduxjs/toolkit';
import type { LLMProvider } from '../../../../types/common';
import type { LoadProvidersParams } from './types';
import { getProviders } from '../../../../api/ai-agents';

export const fetchProviders = createAsyncThunk<
  LLMProvider[],
  LoadProvidersParams,
  { rejectValue: string }
>(
  'config/fetchProviders',
  async ({ orgSlug, projectId }, { rejectWithValue }) => {
    try {
      return await getProviders(orgSlug, projectId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch providers');
    }
  },
);
