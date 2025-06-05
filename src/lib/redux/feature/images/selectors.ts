import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export const selectImagesState = (state: RootState) => state.images;

export const selectAllImages = createSelector(
  selectImagesState,
  (state) => state.images,
);

export const selectImagesLoading = createSelector(
  selectImagesState,
  (state) => state.loading,
);

export const selectImagesError = createSelector(
  selectImagesState,
  (state) => state.error,
);
