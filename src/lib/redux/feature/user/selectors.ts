import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export const selectUserState = (state: RootState) => state.user;

export const selectCurrentUser = createSelector(
  selectUserState,
  (userState) => userState.user,
);

export const selectIsOnboarded = createSelector(
  selectUserState,
  (userState) => userState.user?.isOnboarded,
);
