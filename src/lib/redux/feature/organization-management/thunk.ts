import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { fetchOrganizationMembers } from '../../../../api/organization-management';
import type { OrganizationManagementDataType } from './types';

export const fetchOrganizationManagements = createAsyncThunk<
  OrganizationManagementDataType[],
  {
    orgSlug: string;
    page: number;
    limit: number;
    searchTerm?: string;
  }
>(
  'orgManagement/fetchOrganizationManagements',
  async (
    { orgSlug, page = 1, limit = 10, searchTerm = '' },
    { rejectWithValue },
  ) => {
    try {
      return await fetchOrganizationMembers(orgSlug, page, limit, searchTerm);
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
