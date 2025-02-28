import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { userAdapter } from './adapter';

// 1) Get the slice from the RootState
const selectUserState = (state: RootState) => state.user;

// 2) Create adapter-based selectors
export const {
  selectAll: selectAllManagements,
  selectById: selectManagementById,
  selectEntities: selectManagementEntities,
  selectIds: selectManagementIds,
  selectTotal: selectManagementTotal,
} = userAdapter.getSelectors<RootState>(selectUserState);

// 3) If your slice tracks a "selectedManagement" userId, select it:
export const selectSelectedManagement = createSelector(
  selectUserState,
  (state) => state.selectedManagement,
);

// 4) If you want the selected management object:
export const selectSelectedManagementEntity = createSelector(
  [selectSelectedManagement, selectManagementEntities],
  (selectedUserId, entities) =>
    selectedUserId ? entities[selectedUserId] : undefined,
);
