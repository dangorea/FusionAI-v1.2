import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';

export const fetchOrganizationBlocks = createAsyncThunk(
  'orgBlocks/fetchOrganizationBlocks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Thunk] Fetching organization blocks...');
      // Replace the following with your actual API call, e.g.:
      // const blocks = await readOrganizationBlocks();
      // return blocks;
      return []; // For now, return an empty array
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
