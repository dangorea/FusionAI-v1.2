import type { EntityId } from '@reduxjs/toolkit';
import type { ProjectType } from '../../../../domains/project/model/type';

export interface ProjectsState {
  ids: EntityId[];
  entities: Record<string, ProjectType>;
  selectedProjectId: string | null;
}
