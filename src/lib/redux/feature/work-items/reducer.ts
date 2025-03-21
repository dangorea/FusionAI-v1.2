import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { WorkItemsState } from './types';
import { workItemsAdapter } from './adapter';
import {
  clearCodeSessionThunk,
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
    clearLocalCodeGenerationId(state, action: PayloadAction<string>) {
      const id = action.payload;
      const workItem = state.entities[id];
      if (workItem) {
        state.entities[id] = { ...workItem, codeGenerationId: undefined };
      }
    },
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
    builder.addCase(clearCodeSessionThunk.fulfilled, (state, action) => {
      workItemsAdapter.upsertOne(state, action.payload);
    });
  },
});

export const { setSelectedWorkItem, setWorkItems, clearLocalCodeGenerationId } =
  workItemsSlice.actions;
export default workItemsSlice.reducer;
