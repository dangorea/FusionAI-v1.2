import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { organizationAdapter } from './adapter';

const selectOrganizationState = (state: RootState) => state.organization;

export const {
  selectAll: selectAllOrganizations,
  selectById: selectOrganizationById,
  selectEntities: selectOrganizationEntities,
  selectIds: selectOrganizationIds,
  selectTotal: selectOrganizationTotal,
} = organizationAdapter.getSelectors<RootState>(selectOrganizationState);

export const selectCurrentOrganizationId = createSelector(
  selectOrganizationState,
  (state) => state.selectedOrganization || 'default',
);

export const selectSelectedOrganizationEntity = createSelector(
  [selectAllOrganizations, selectCurrentOrganizationId],
  (organizations, currentId) => {
    if (!currentId) return null;
    return organizations.find((org) => org._id === currentId) ?? null;
  },
);
