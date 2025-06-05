import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import type {
  CreateWorkItemParams,
  DeleteWorkItemParams,
  LoadWorkItemsParams,
  LoadWorkItemsResponse,
} from './types';
import {
  createWorkItem as createWorkItemApi,
  deleteWorkItem as deleteWorkItemApi,
  fetchWorkItems,
  updateWorkItem,
} from '../../../../api/work-items';
import type { WorkItemType } from '../../../../domains/work-item/model/types';

export const loadWorkItemsThunk = createAsyncThunk<
  LoadWorkItemsResponse,
  LoadWorkItemsParams
>(
  'workItems/loadWorkItems',
  async (
    { page = 1, limit = 10, searchTerm = '', orgSlug, projectId },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWorkItems(orgSlug, projectId, searchTerm, limit, page);
    } catch (error: any) {
      console.error('Error loading work items:', error);
      return rejectWithValue(error);
    }
  },
);

export const createWorkItemThunk = createAsyncThunk<
  WorkItemType,
  CreateWorkItemParams
>(
  'workItems/createWorkItem',
  async ({ orgSlug, projectId, description }, { rejectWithValue }) => {
    try {
      return await createWorkItemApi(orgSlug, projectId, {
        description,
      });
    } catch (error: any) {
      console.error('Error creating work item:', error);
      return rejectWithValue(error);
    }
  },
);

export const updateWorkItemThunk = createAsyncThunk<
  WorkItemType,
  {
    orgSlug: string;
    projectId: string;
    workItem: Partial<WorkItemType>;
    signal?: AbortSignal;
  }
>(
  'workItems/updateWorkItem',
  async ({ orgSlug, projectId, workItem, signal }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateWorkItem(
        orgSlug,
        projectId,
        workItem,
        signal,
      );
      return updatedItem;
    } catch (error: any) {
      console.error('Error updating work item:', error);
      notification.error({
        message: 'Failed to Update Work Item',
        description: error.message,
      });
      return rejectWithValue(error);
    }
  },
);

export const deleteWorkItemThunk = createAsyncThunk<
  string,
  DeleteWorkItemParams
>(
  'workItems/deleteWorkItem',
  async ({ orgSlug, projectId, id }, { rejectWithValue }) => {
    try {
      await deleteWorkItemApi(orgSlug, projectId, id);
      return id;
    } catch (error: any) {
      console.error('Error deleting work item:', error);
      return rejectWithValue(error);
    }
  },
);
