import { EntityId } from '@reduxjs/toolkit';

export interface ProjectDataType {
  id: string;
  title: string;
  details: string;
  organization: string;
}

export interface ProjectsState {
  ids: EntityId[];
  entities: Record<string, ProjectDataType>;
  selectedProjectId: string | null;
}
