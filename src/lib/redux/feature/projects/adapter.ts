import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { ProjectDataType } from './types';

export const projectsAdapter = createEntityAdapter<ProjectDataType, EntityId>({
  selectId: (project) => project.id,
});
