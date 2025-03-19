import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import type {
  CreateWorkItemParams,
  DeleteWorkItemParams,
  LoadWorkItemsParams,
  LoadWorkItemsResponse,
  UpdateWorkItemParams,
} from './types';
import {
  clearCodeSession,
  createWorkItem as createWorkItemApi,
  deleteWorkItem as deleteWorkItemApi,
  fetchWorkItems,
  generateCodeSession,
  updateWorkItem,
} from '../../../../api/work-items';
import type { WorkItemType } from '../../../../domains/work-item/model/types';
import type { RootState } from '../../store';
import { clearCodeGeneration } from '../code-generation/reducer';

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
      const response = await fetchWorkItems(
        orgSlug,
        projectId,
        searchTerm,
        limit,
        page,
      );
      return response;
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
        projectId,
      });
    } catch (error: any) {
      console.error('Error creating work item:', error);
      return rejectWithValue(error);
    }
  },
);

export const updateWorkItemThunk = createAsyncThunk<
  WorkItemType,
  UpdateWorkItemParams
>(
  'workItems/updateWorkItem',
  async ({ orgSlug, projectId, workItem }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateWorkItem(orgSlug, projectId, workItem);
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

export const updateCodeSession = createAsyncThunk<
  WorkItemType,
  { orgSlug: string; projectId: string; id: string },
  { state: RootState }
>(
  'workItems/updateCodeSession',
  async ({ orgSlug, projectId, id }, { rejectWithValue }) => {
    try {
      return await generateCodeSession(orgSlug, projectId, id);
    } catch (error: any) {
      console.error('Error updating work item:', error);
      return rejectWithValue(error);
    }
  },
);

export const clearCodeSessionThunk = createAsyncThunk<
  WorkItemType,
  { orgSlug: string; projectId: string; id: string },
  { rejectValue: string }
>(
  'workItems/clearCodeSession',
  async ({ orgSlug, projectId, id }, { dispatch, rejectWithValue }) => {
    try {
      const updatedWorkItem = await clearCodeSession(orgSlug, projectId, id);
      dispatch(clearCodeGeneration());
      return updatedWorkItem as WorkItemType;
    } catch (error: any) {
      console.error('Error clearing code session:', error);
      return rejectWithValue(error.message);
    }
  },
);
