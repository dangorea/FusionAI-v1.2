import type { EntityId } from '@reduxjs/toolkit';
import type { WorkItemType } from '../../../../domains/work-item/model/types';

export interface LoadWorkItemsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  orgSlug: string;
  projectId: string;
}

export interface LoadWorkItemsResponse {
  data: WorkItemType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateWorkItemParams
  extends Pick<WorkItemType, 'projectId' | 'description'> {
  orgSlug: string;
}

export interface UpdateWorkItemParams extends Pick<WorkItemType, 'projectId'> {
  orgSlug: string;
  workItem: Pick<WorkItemType, 'id' | 'description'>;
}

export interface DeleteWorkItemParams
  extends Pick<WorkItemType, 'id' | 'projectId'> {
  orgSlug: string;
}

export interface WorkItemsState {
  ids: EntityId[];
  entities: Record<string, WorkItemType>;
  editingWorkItem: string | null;
}
