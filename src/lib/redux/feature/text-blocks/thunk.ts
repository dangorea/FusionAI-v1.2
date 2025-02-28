import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { TextBlockDataType } from './types';
import { readTextBlocks } from '../../../../api/textBlocks';

export const fetchTextBlocks = createAsyncThunk(
  'textBlocks/fetchTextBlocks',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      const blocks = await readTextBlocks(orgSlug);
      if (!blocks || !Array.isArray(blocks)) {
        throw new Error('Fetched text blocks are invalid or undefined.');
      }

      const transformed: TextBlockDataType[] = blocks.map((block: any) => ({
        id: block.id,
        title: block.title,
        details: block.details,
        organization: block.organization,
      }));

      return transformed;
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
