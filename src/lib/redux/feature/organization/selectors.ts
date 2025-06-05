import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
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
  (state) => state.selectedOrganization,
);

export const selectSelectedOrganizationEntity = createSelector(
  [selectAllOrganizations, selectCurrentOrganizationId],
  (organizations, currentId) => {
    if (!currentId) return null;
    return organizations.find((org) => org.id === currentId) ?? null;
  },
);
