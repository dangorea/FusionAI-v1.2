import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { organizationManagementAdapter } from './adapter';

const selectOrganizationManagementState = (state: RootState) =>
  state.organizationManagement;

export const {
  selectAll: selectAllManagements,
  selectById: selectManagementById,
  selectEntities: selectManagementEntities,
  selectIds: selectManagementIds,
  selectTotal: selectManagementTotal,
} = organizationManagementAdapter.getSelectors<RootState>(
  selectOrganizationManagementState,
);

export const selectSelectedManagement = createSelector(
  selectOrganizationManagementState,
  (state) => state.selectedManagement,
);

export const selectSelectedManagementEntity = createSelector(
  [selectSelectedManagement, selectManagementEntities],
  (selectedUserId, entities) =>
    selectedUserId ? entities[selectedUserId] : undefined,
);
