import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { RuleType } from './types';
import { readTextBlocks } from '../../../../api/textBlocks';

export const fetchRules = createAsyncThunk(
  'rules/fetchRules',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      const blocks = await readTextBlocks(orgSlug);
      if (!blocks || !Array.isArray(blocks)) {
        throw new Error('Fetched rules are invalid or undefined.');
      }

      const transformed: RuleType[] = blocks.map((block: any) => ({
        id: block.id,
        title: block.title,
        details: block.details,
        organization: block.organization,
      }));

      return transformed;
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch rules:', error);
      notification.error({
        message: 'Failed to fetch rules',
        description: 'There was an issue fetching rules from the server.',
      });
      return rejectWithValue(error);
    }
  },
);
