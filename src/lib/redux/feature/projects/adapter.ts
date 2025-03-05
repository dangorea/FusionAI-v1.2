import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { ProjectType } from '../../../../domains/project/model/type';

export const projectsAdapter = createEntityAdapter<ProjectType, EntityId>({
  selectId: (project) => project.id,
});
