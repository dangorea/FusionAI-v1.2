import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { workItemsAdapter } from './adapter';

const selectWorkItemsState = (state: RootState) => state.workItems;

export const {
  selectAll: selectAllWorkItems,
  selectById: selectWorkItemById,
  selectEntities: selectWorkItemEntities,
  selectIds: selectWorkItemIds,
  selectTotal: selectWorkItemTotal,
} = workItemsAdapter.getSelectors<RootState>(selectWorkItemsState);

export const selectEditingWorkItem = createSelector(
  selectWorkItemsState,
  (state) => state.editingWorkItem,
);

export const selectEditingWorkItemEntity = createSelector(
  [selectEditingWorkItem, selectWorkItemEntities],
  (editingId, entities) => (editingId ? entities[editingId] : undefined),
);
