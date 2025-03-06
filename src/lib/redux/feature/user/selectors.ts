import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { userAdapter } from './adapter';

const selectUserState = (state: RootState) => state.user;

export const {
  selectAll: selectAllManagements,
  selectById: selectManagementById,
  selectEntities: selectManagementEntities,
  selectIds: selectManagementIds,
  selectTotal: selectManagementTotal,
} = userAdapter.getSelectors<RootState>(selectUserState);

export const selectSelectedManagement = createSelector(
  selectUserState,
  (state) => state.selectedManagement,
);

export const selectSelectedManagementEntity = createSelector(
  [selectSelectedManagement, selectManagementEntities],
  (selectedUserId, entities) =>
    selectedUserId ? entities[selectedUserId] : undefined,
);
