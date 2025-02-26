import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { TextBlockDataType } from './types';

export const fetchTextBlocks = createAsyncThunk(
  'textBlocks/fetchTextBlocks',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      // Replace with your actual API call, e.g.:
      // const blocks = await readTextBlocks(orgSlug);
      // return blocks.map((block: any) => ({
      //   id: block.id,
      //   title: block.title,
      //   details: block.details,
      //   organization: block.organization,
      // }));
      return [] as TextBlockDataType[];
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch text blocks:', error);
      notification.error({
        message: 'Failed to fetch text blocks',
        description: 'There was an issue fetching text blocks from the server.',
      });
      return rejectWithValue(error);
    }
  },
);
