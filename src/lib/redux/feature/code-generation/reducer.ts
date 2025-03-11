import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CodeGenerationResult, CodeGenerationState } from './types';
import { fetchCodeGeneration } from './thunk';

const initialState: CodeGenerationState = {
  result: null,
  latestFiles: null,
  loading: false,
  error: null,
};

const codeGenerationSlice = createSlice({
  name: 'codeGeneration',
  initialState,
  reducers: {
    clearCodeGeneration(state) {
      state.result = null;
      state.latestFiles = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCodeGeneration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCodeGeneration.fulfilled,
      (
        state,
        action: PayloadAction<{
          result: CodeGenerationResult;
          latestFiles: Record<string, string>;
        }>,
      ) => {
        state.loading = false;
        state.result = action.payload.result;
        state.latestFiles = action.payload.latestFiles;
      },
    );
    builder.addCase(fetchCodeGeneration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Error fetching code generation';
    });
  },
});

export const { clearCodeGeneration } = codeGenerationSlice.actions;
export default codeGenerationSlice.reducer;
