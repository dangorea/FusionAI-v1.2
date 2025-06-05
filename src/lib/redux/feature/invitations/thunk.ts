import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  getUserInvitations,
  acceptInvitation as apiAccept,
  declineInvitation as apiDecline,
} from '../../../../api/invitations';
import type { InvitationType } from '../../../../domains/settings/model/types';

// fetch all invitations for current user
export const fetchInvitations = createAsyncThunk<InvitationType[]>(
  'invitations/fetchInvitations',
  async (_, { rejectWithValue }) => {
    try {
      return await getUserInvitations();
    } catch (err: any) {
      notification.error({
        message: 'Failed to Fetch Invitations',
        description: err.message,
      });
      return rejectWithValue(err);
    }
  },
);

// accept an invitation and refetch
export const acceptInvitationThunk = createAsyncThunk<string, string>(
  'invitations/acceptInvitation',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await apiAccept(id);
      notification.success({ message: 'Invitation Accepted' });
      dispatch(fetchInvitations());
      return id;
    } catch (err: any) {
      notification.error({
        message: 'Accept Failed',
        description: err.message,
      });
      return rejectWithValue(err);
    }
  },
);

// decline an invitation and refetch
export const declineInvitationThunk = createAsyncThunk<string, string>(
  'invitations/declineInvitation',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await apiDecline(id);
      notification.success({ message: 'Invitation Declined' });
      dispatch(fetchInvitations());
      return id;
    } catch (err: any) {
      notification.error({
        message: 'Decline Failed',
        description: err.message,
      });
      return rejectWithValue(err);
    }
  },
);
