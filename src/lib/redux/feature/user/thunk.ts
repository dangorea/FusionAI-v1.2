import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { fetchOrganizationMembers } from '../../../../api/organizationManagment';

export const fetchOrganizationManagements = createAsyncThunk(
  'orgManagement/fetchOrganizationManagements',
  async (slug: string, { rejectWithValue }) => {
    try {
      const managements = await fetchOrganizationMembers(slug);
      return managements;
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch organization managements:', error);
      notification.error({
        message: 'Failed to Fetch Organization Managements',
        description:
          'There was an issue fetching organization managements from the server.',
      });
      return rejectWithValue(error);
    }
  },
);
