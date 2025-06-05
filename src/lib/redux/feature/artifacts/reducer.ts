import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ArtifactState, ArtifactType, GenerationType } from './types';
import { executeAICoder, fetchCodeArtifactById } from './thunk';
import { ARTIFACT_REDUCER_NAME } from '../../reducer-constant';

const initialState: ArtifactState = {
  result: null,
  latestFiles: null,
  selectedIterationId: null,
  loading: false,
  error: null,
};

const codeGenerationSlice = createSlice({
  name: ARTIFACT_REDUCER_NAME,
  initialState,
  reducers: {
    clearArtifact(state) {
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
    builder
      // Handle fetchCodeArtifactById thunk
      .addCase(fetchCodeArtifactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCodeArtifactById.fulfilled,
        (state, action: PayloadAction<ArtifactType>) => {
          state.loading = false;
          const artifact = action.payload;
          artifact.iterations = artifact.iterations.map((iteration) => {
            if (!iteration.files) {
              iteration.files = {};
            } else {
              Object.keys(iteration.files).forEach((key) => {
                const fileContent = iteration.files[key];
                if (typeof fileContent === 'string') {
                  iteration.files[key] = { content: fileContent };
                }
              });
            }
            return iteration;
          });
          state.result = artifact;
          if (artifact.iterations.length > 0) {
            const latestIteration =
              artifact.iterations[artifact.iterations.length - 1];
            state.latestFiles = latestIteration?.files ?? {};
            state.selectedIterationId = latestIteration?.id;
          } else {
            state.latestFiles = {};
            state.selectedIterationId = null;
          }
        },
      )
      .addCase(fetchCodeArtifactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching code generation';
      })
      .addCase(executeAICoder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        executeAICoder.fulfilled,
        (state, action: PayloadAction<GenerationType>) => {
          state.loading = false;
          const { artifact } = action.payload.result;
          artifact.iterations = artifact.iterations.map((iteration) => {
            if (!iteration.files) {
              iteration.files = {};
            } else {
              Object.keys(iteration.files).forEach((key) => {
                const fileContent = iteration.files[key];
                if (typeof fileContent === 'string') {
                  iteration.files[key] = { content: fileContent };
                }
              });
            }
            return iteration;
          });
          state.result = artifact;
          if (artifact.iterations.length > 0) {
            const latestIteration =
              artifact.iterations[artifact.iterations.length - 1];
            state.latestFiles = latestIteration.files || {};
            state.selectedIterationId = latestIteration.id;
          } else {
            state.latestFiles = {};
            state.selectedIterationId = null;
          }
        },
      )
      .addCase(executeAICoder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error generating code';
      });
  },
});

export function getSelectedIteration(state: ArtifactState) {
  if (!state.result || !state.result.iterations || !state.selectedIterationId) {
    return undefined;
  }
  return state.result.iterations.find(
    (iteration) => iteration.id === state.selectedIterationId,
  );
}

export const { clearArtifact, updateSelectedIteration } =
  codeGenerationSlice.actions;

export default codeGenerationSlice.reducer;
