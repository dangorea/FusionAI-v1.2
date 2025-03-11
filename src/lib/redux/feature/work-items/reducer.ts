import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { WorkItemsState } from './types';
import { workItemsAdapter } from './adapter';
import {
  createWorkItemThunk,
  deleteWorkItemThunk,
  loadWorkItemsThunk,
  updateCodeSession,
  updateWorkItemThunk,
} from './thunk';
import { WORK_ITEMS_REDUCER_NAME } from '../../reducer-constant';

const initialState: WorkItemsState = workItemsAdapter.getInitialState({
  selectedWorkItem: null,
});

const workItemsSlice = createSlice({
  name: WORK_ITEMS_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedWorkItem(state, action: PayloadAction<string | null>) {
      state.selectedWorkItem = action.payload;
    },
    setWorkItems: workItemsAdapter.setAll,
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkItemsThunk.fulfilled, (state, action) => {
      workItemsAdapter.setAll(state, action.payload.data);
    });
    builder.addCase(createWorkItemThunk.fulfilled, (state, action) => {
      workItemsAdapter.addOne(state, action.payload);
    });
    builder.addCase(updateWorkItemThunk.fulfilled, (state, action) => {
      workItemsAdapter.upsertOne(state, action.payload);
    });
    builder.addCase(deleteWorkItemThunk.fulfilled, (state, action) => {
      workItemsAdapter.removeOne(state, action.payload);
    });
    builder.addCase(updateCodeSession.fulfilled, (state, action) => {
      workItemsAdapter.upsertOne(state, action.payload);
    });
  },
});

export const { setSelectedWorkItem, setWorkItems } = workItemsSlice.actions;
export default workItemsSlice.reducer;
