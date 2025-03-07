import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

const selectAuthState = (state: RootState) => state.auth;

export const getToken = createSelector(selectAuthState, (state) => state.token);
