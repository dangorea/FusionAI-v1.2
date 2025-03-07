import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { readOrganizationBlocks } from '../../../../api/organization-blocks';

export const fetchOrganizationBlocks = createAsyncThunk(
  'orgBlocks/fetchOrganizationBlocks',
  async (_, { rejectWithValue }) => {
    try {
      const blocks = await readOrganizationBlocks();
      return blocks;
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch organization blocks:', error);
      notification.error({
        message: 'Failed to Fetch Organization Blocks',
        description:
          'There was an issue fetching organization blocks from the server.',
      });
      return rejectWithValue(error);
    }
  },
);
