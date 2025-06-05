import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { CONTEXT_REDUCER_NAME } from '../../reducer-constant';

const selectContextState = (state: RootState) => state[CONTEXT_REDUCER_NAME];

export const selectContext = createSelector(
  selectContextState,
  (contextState) => contextState.context,
);

export const selectContextLoading = createSelector(
  selectContextState,
  (contextState) => contextState.loading,
);

export const selectContextError = createSelector(
  selectContextState,
  (contextState) => contextState.error,
);

export const selectContextDescription = createSelector(
  selectContext,
  (context) => context?.description,
);

export const selectContextSourceFiles = createSelector(
  selectContext,
  (context) => context?.sourceFiles,
);

export const selectContextTextBlocks = createSelector(
  selectContext,
  (context) => context?.textBlocks,
);
