import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  CreateWorkItemParams,
  DeleteWorkItemParams,
  LoadWorkItemsParams,
  LoadWorkItemsResponse,
  UpdateWorkItemParams,
} from './types';
import { WorkItem } from '../../../../types/common';
import {
  createWorkItem as createWorkItemApi,
  deleteWorkItem as deleteWorkItemApi,
  fetchWorkItems,
  updateWorkItem,
} from '../../../../api/workItems';

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
  WorkItem,
  CreateWorkItemParams
>(
  'workItems/createWorkItem',
  async ({ orgSlug, projectId, description }, { rejectWithValue }) => {
    try {
      const newWorkItem = await createWorkItemApi(orgSlug, projectId, {
        description,
        projectId,
      });
      return newWorkItem;
    } catch (error: any) {
      console.error('Error creating work item:', error);
      return rejectWithValue(error);
    }
  },
);

export const updateWorkItemThunk = createAsyncThunk<
  WorkItem,
  UpdateWorkItemParams
>(
  'workItems/updateWorkItem',
  async ({ orgSlug, projectId, workItem }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateWorkItem(orgSlug, projectId, workItem);
      notification.success({ message: 'Work Item Updated Successfully' });
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
