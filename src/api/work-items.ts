import instance, { BASE_URL } from '../services/api';
import type { WorkItemType } from '../domains/work-item/model/types';

const WORK_ITEMS_BASE_URL = (orgSlug: string, projectId: string) =>
  `${BASE_URL}/orgs/${orgSlug}/projects/${projectId}/work-items`;

export type CreateWorkItem = Pick<WorkItemType, 'description' | 'projectId'>;

export const createWorkItem = async (
  orgSlug: string,
  projectId: string,
  data: CreateWorkItem,
): Promise<WorkItemType> => {
  try {
    const url = WORK_ITEMS_BASE_URL(orgSlug, projectId);
    const response = await instance.post<WorkItemType>(url, data);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export async function generateCodeSession(
  orgSlug: string,
  projectId: string,
  id: string,
): Promise<WorkItemType> {
  try {
    const url = WORK_ITEMS_BASE_URL(orgSlug, projectId);
    const response = await instance.post<WorkItemType>(`${url}/${id}/generate`);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
}

export async function clearCodeSession(
  orgSlug: string,
  projectId: string,
  id: string,
): Promise<WorkItemType> {
  try {
    const url = WORK_ITEMS_BASE_URL(orgSlug, projectId);
    const response = await instance.patch<WorkItemType>(
      `${url}/${id}/clear-code-session`,
    );
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
}

export const updateWorkItem = async (
  orgSlug: string,
  projectId: string,
  updatedWorkItem: Partial<WorkItemType>,
): Promise<WorkItemType> => {
  try {
    if (!updatedWorkItem || !updatedWorkItem.id) {
      throw new Error(
        'Invalid work item: updatedWorkItem is undefined or missing an id.',
      );
    }
    const { id, ...workItemWithoutId } = updatedWorkItem;

    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}/${id}`;

    const response = await instance.patch<WorkItemType>(url, workItemWithoutId);
    return response.data;
  } catch (error) {
    console.error('[API] PATCH request failed:', error);
    throw error;
  }
};

export const fetchWorkItems = async (
  orgSlug: string,
  projectId: string,
  searchTerm: string,
  limit?: number,
  page: number = 1,
): Promise<{
  data: WorkItemType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`;

    const response = await instance.get<{
      data: WorkItemType[];
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }>(url);
    return response.data;
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const deleteWorkItem = async (
  orgSlug: string,
  projectId: string,
  id: string,
): Promise<void> => {
  try {
    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}/${id}`;
    return await instance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
