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

export const selectSelectedWorkItem = createSelector(
  selectWorkItemsState,
  (state) => state.selectedWorkItem,
);

export const selectSelectedWorkItemEntity = createSelector(
  [selectSelectedWorkItem, selectWorkItemEntities],
  (selectedId, entities) => (selectedId ? entities[selectedId] : undefined),
);
