import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkItemsState } from './types';
import { workItemsAdapter } from './adapter';
import {
  createWorkItemThunk,
  deleteWorkItemThunk,
  loadWorkItemsThunk,
  updateWorkItemThunk,
} from './thunk';
import { WORK_ITEMS_REDUCER_NAME } from '../../reducer-constant';

const initialState: WorkItemsState = workItemsAdapter.getInitialState({
  editingWorkItem: null,
});

const workItemsSlice = createSlice({
  name: WORK_ITEMS_REDUCER_NAME,
  initialState,
  reducers: {
    setEditingWorkItem(state, action: PayloadAction<string | null>) {
      state.editingWorkItem = action.payload;
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
  },
});

export const { setEditingWorkItem, setWorkItems } = workItemsSlice.actions;
export default workItemsSlice.reducer;
