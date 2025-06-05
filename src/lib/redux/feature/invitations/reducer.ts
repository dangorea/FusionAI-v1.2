import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { invitationsAdapter } from './adapter';
import { type InvitationsState } from './types';
import { fetchInvitations } from './thunk';
import { INVITATIONS_REDUCER_NAME } from '../../reducer-constant';

const initialState: InvitationsState = invitationsAdapter.getInitialState({
  loading: false,
  selectedInvitationId: null,
});

const invitationsSlice = createSlice({
  name: INVITATIONS_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedInvitationId(state, action: PayloadAction<string | null>) {
      state.selectedInvitationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvitations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        invitationsAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchInvitations.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSelectedInvitationId } = invitationsSlice.actions;
export default invitationsSlice.reducer;
