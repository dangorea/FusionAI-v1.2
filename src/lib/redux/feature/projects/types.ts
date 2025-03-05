import { EntityId } from '@reduxjs/toolkit';
import { ProjectType } from '../../../../domains/project/model/type';

export interface ProjectsState {
  ids: EntityId[];
  entities: Record<string, ProjectType>;
  selectedProjectId: string | null;
}
