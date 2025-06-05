import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  createTextBlock,
  deleteTextBlock,
  readTextBlocks,
  updateTextBlock,
} from '../../../../api/text-blocks';
import type { TextBlockCategory, TextBlockType } from './types';

export const fetchTextBlocks = createAsyncThunk<
  { blockType: TextBlockCategory; blocks: TextBlockType[] },
  {
    orgSlug: string;
    page: number;
    limit: number;
    searchTerm?: string;
    blockType: TextBlockCategory;
    projectId?: string;
    scope?: string;
  }
>(
  'text-block/fetchTextBlocks',
  async (
    {
      page = 1,
      limit = 10,
      searchTerm = '',
      orgSlug,
      blockType,
      projectId,
      scope = 'project_and_organization',
    },
    { rejectWithValue },
  ) => {
    try {
      const blocks = await readTextBlocks(
        orgSlug,
        searchTerm,
        limit,
        blockType,
        page,
        scope,
        projectId,
      );

      if (!blocks || !Array.isArray(blocks)) {
        throw new Error('Fetched text blocks are invalid or undefined.');
      }

      return { blockType, blocks };
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

export const createTextBlockThunk = createAsyncThunk<
  TextBlockType, // Returned payload on success.
  {
    orgSlug: string;
    newTextBlock: Omit<TextBlockType, 'id'>;
    projectId?: string;
  },
  { rejectValue: string }
>(
  'text-block/createTextBlock',
  async ({ orgSlug, newTextBlock, projectId }, { rejectWithValue }) => {
    try {
      // Only add projectId when it's provided
      const blockToCreate = projectId
        ? { ...newTextBlock, projectId }
        : newTextBlock;
      const block = await createTextBlock(orgSlug, blockToCreate);
      return block;
    } catch (error: any) {
      console.error('[Thunk] Failed to create text block:', error);
      return rejectWithValue(error.message);
    }
  },
);

export const updateTextBlockThunk = createAsyncThunk<
  TextBlockType,
  { orgSlug: string; updatedTextBlock: TextBlockType },
  { rejectValue: string }
>(
  'text-block/updateTextBlock',
  async ({ orgSlug, updatedTextBlock }, { rejectWithValue }) => {
    try {
      const block = await updateTextBlock(orgSlug, updatedTextBlock);
      return block;
    } catch (error: any) {
      console.error('[Thunk] Failed to update text block:', error);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTextBlockThunk = createAsyncThunk<
  string, // Return the id on success.
  { orgSlug: string; id: string },
  { rejectValue: string }
>(
  'text-block/deleteTextBlock',
  async ({ orgSlug, id }, { rejectWithValue }) => {
    try {
      await deleteTextBlock(orgSlug, id);
      return id;
    } catch (error: any) {
      console.error('[Thunk] Failed to delete text block:', error);
      return rejectWithValue(error.message);
    }
  },
);
