import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { CodeGenerationResult, CodeGenerationState } from './types';
import { fetchCodeGeneration } from './thunk';

const initialState: CodeGenerationState = {
  result: null,
  latestFiles: null,
  selectedIterationId: null,
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
      state.selectedIterationId = null;
    },
    updateSelectedIteration(state, action: PayloadAction<string>) {
      state.selectedIterationId = action.payload;
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
        if (action.payload.result.iterations.length > 0) {
          state.selectedIterationId =
            action.payload.result.iterations[
              action.payload.result.iterations.length - 1
            ]._id;
        }
      },
    );
    builder.addCase(fetchCodeGeneration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Error fetching code generation';
    });
  },
});

export const { clearCodeGeneration, updateSelectedIteration } =
  codeGenerationSlice.actions;
export default codeGenerationSlice.reducer;
