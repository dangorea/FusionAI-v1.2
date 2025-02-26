import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';

export const fetchOrganizationManagements = createAsyncThunk(
  'orgManagement/fetchOrganizationManagements',
  async (slug: string, { rejectWithValue }) => {
    try {
      console.log('[Thunk] Fetching organization managements...');
      // Replace with your actual API call, e.g.:
      // const managements = await fetchOrganizationMembers(slug);
      // return managements;
      return []; // Return an empty array for now
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
