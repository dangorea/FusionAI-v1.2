// src/lib/redux/feature/context/context.slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ContextType } from './types';
import { CONTEXT_REDUCER_NAME } from '../../reducer-constant';
import {
  deleteContextThunk,
  fetchContextThunk,
  updateContextThunk,
} from './thunk';

export interface ContextState {
  context: ContextType | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContextState = {
  context: null,
  loading: false,
  error: null,
};

const contextSlice = createSlice({
  name: CONTEXT_REDUCER_NAME,
  initialState,
  reducers: {
    clearContext(state) {
      state.context = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch context
    builder.addCase(fetchContextThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchContextThunk.fulfilled,
      (state, action: PayloadAction<ContextType>) => {
        state.loading = false;
        state.context = action.payload;
      },
    );
    builder.addCase(fetchContextThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    // update context
    builder.addCase(updateContextThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateContextThunk.fulfilled,
      (state, action: PayloadAction<ContextType>) => {
        state.loading = false;
        state.context = action.payload;
      },
    );
    builder.addCase(updateContextThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(deleteContextThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteContextThunk.fulfilled, (state) => {
      state.loading = false;
      state.context = null;
    });
    builder.addCase(deleteContextThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearContext } = contextSlice.actions;
export default contextSlice.reducer;
