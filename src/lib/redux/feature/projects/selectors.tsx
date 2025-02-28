import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { projectsAdapter } from './adapter';

const selectProjectsState = (state: RootState) => state.projects;

export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectEntities: selectProjectEntities,
  selectIds: selectProjectIds,
  selectTotal: selectProjectTotal,
} = projectsAdapter.getSelectors<RootState>(selectProjectsState);

export const selectSelectedProjectId = createSelector(
  selectProjectsState,
  (state) => state.selectedProjectId,
);

export const selectSelectedProject = createSelector(
  [selectSelectedProjectId, selectProjectEntities],
  (projId, entities) => (projId ? entities[projId] : undefined),
);
