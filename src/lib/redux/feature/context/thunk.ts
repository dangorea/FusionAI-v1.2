import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  deleteContext,
  getContext,
  updateContext,
} from '../../../../api/context';
import type { ContextType } from './types';

export const fetchContextThunk = createAsyncThunk<
  ContextType,
  { contextId: string; orgSlug: string; projectId: string },
  { rejectValue: string }
>(
  'context/fetchContext',
  async ({ contextId, orgSlug, projectId }, { rejectWithValue }) => {
    try {
      return await getContext(contextId, orgSlug, projectId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateContextThunk = createAsyncThunk<
  ContextType,
  {
    contextId: string;
    orgSlug: string;
    projectId: string;
    updateData: Partial<
      ContextType & { textBlockIds: string[]; imageIds: string[] }
    >;
    signal?: AbortSignal;
  },
  { rejectValue: string }
>(
  'context/updateContext',
  async (
    { contextId, orgSlug, projectId, updateData, signal },
    { rejectWithValue },
  ) => {
    try {
      return await updateContext(
        contextId,
        orgSlug,
        projectId,
        updateData,
        signal,
      );
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteContextThunk = createAsyncThunk<
  void,
  { contextId: string; orgSlug: string; projectId: string },
  { rejectValue: string }
>(
  'context/deleteContext',
  async ({ contextId, orgSlug, projectId }, { rejectWithValue }) => {
    try {
      await deleteContext(contextId, orgSlug, projectId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
