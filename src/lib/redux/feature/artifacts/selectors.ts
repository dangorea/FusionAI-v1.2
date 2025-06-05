import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { ArtifactIteration, ArtifactState } from './types';

export const selectCodeGenerationState = (state: RootState) => state.artifact;

export const selectCodeGenerationSelectedIterationId = (state: RootState) =>
  state.artifact.selectedIterationId;

export const selectSelectedIteration = createSelector(
  [selectCodeGenerationState],
  (codeGenState) => {
    if (!codeGenState.result || !codeGenState.selectedIterationId)
      return undefined;
    return codeGenState.result.iterations.find(
      (it) => it.id === codeGenState.selectedIterationId,
    );
  },
);

export function getIterationById(
  codeGenState: ArtifactState,
  iterationId: string,
): ArtifactIteration | undefined {
  if (!codeGenState.result?.iterations) return undefined;
  return codeGenState.result.iterations.find((it) => it.id === iterationId);
}
