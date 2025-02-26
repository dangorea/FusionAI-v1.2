import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { organizationAdapter } from './adapter';

const selectOrganizationState = (state: RootState) => state.organization;

export const {
  selectAll: selectAllOrganizations,
  selectById: selectOrganizationById,
} = organizationAdapter.getSelectors(selectOrganizationState);

export const selectCurrentOrgSlug = createSelector(
  selectOrganizationState,
  (state) => state.selectedOrganization || 'default',
);
