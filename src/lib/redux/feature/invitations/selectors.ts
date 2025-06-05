import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { invitationsAdapter } from './adapter';
import { INVITATIONS_REDUCER_NAME } from '../../reducer-constant';

const selectInvState = (state: RootState) => state[INVITATIONS_REDUCER_NAME];

export const {
  selectAll: selectAllInvitations,
  selectById: selectInvitationById,
  selectTotal: selectInvitationsTotal,
} = invitationsAdapter.getSelectors<RootState>(selectInvState);

export const selectInvitationsLoading = createSelector(
  selectInvState,
  (state) => state.loading,
);

export const selectSelectedInvitationId = createSelector(
  selectInvState,
  (state) => state.selectedInvitationId,
);
