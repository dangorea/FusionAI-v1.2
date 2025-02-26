import { EntityId } from '@reduxjs/toolkit';
import { WorkItem } from '../../../../types/common';

export interface LoadWorkItemsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  orgSlug: string;
  projectId: string;
}

export interface LoadWorkItemsResponse {
  data: WorkItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateWorkItemParams {
  orgSlug: string;
  projectId: string;
  description: string;
}

export interface UpdateWorkItemParams {
  orgSlug: string;
  projectId: string;
  workItem: WorkItem;
}

export interface DeleteWorkItemParams {
  orgSlug: string;
  projectId: string;
  id: string;
}

export interface WorkItemsState {
  // Normalized state shape
  ids: EntityId[];
  entities: Record<string, WorkItem>;
  // UI state: store the editing work item id
  editingWorkItem: string | null;
}
