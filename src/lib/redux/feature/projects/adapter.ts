import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { ProjectType } from '../../../../domains/project/model/type';

export const projectsAdapter = createEntityAdapter<ProjectType, EntityId>({
  selectId: (project) => project.id,
});
