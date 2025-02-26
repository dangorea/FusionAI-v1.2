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
      console.log('loadWorkItemsThunk', {
        page,
        limit,
        searchTerm,
        orgSlug,
        projectId,
      });
      // Replace with your actual API call, e.g.:
      // const response = await fetchWorkItems(orgSlug, projectId, page, limit, searchTerm);
      // return response;
      return {} as LoadWorkItemsResponse;
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
      console.log('createWorkItemThunk', { description, orgSlug, projectId });
      // Replace with your actual API call, e.g.:
      // const newWorkItem = await createWorkItemApi(orgSlug, projectId, { description });
      // return newWorkItem;
      return {} as WorkItem;
    } catch (error: any) {
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
      console.log('updateWorkItemThunk', { workItem, orgSlug, projectId });
      // Replace with your actual API call, e.g.:
      // const updatedItem = await updateWorkItem(orgSlug, projectId, workItem);
      // notification.success({ message: 'Work Item Updated Successfully' });
      // return updatedItem;
      return {} as WorkItem;
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
      console.log('deleteWorkItemThunk', { orgSlug, projectId, id });
      // Replace with your actual API call, e.g.:
      // await deleteWorkItemApi(orgSlug, projectId, id);
      return id;
    } catch (error: any) {
      console.error('Error deleting work item:', error);
      return rejectWithValue(error);
    }
  },
);
