import axiosInstance, { BASE_URL } from './utils/axiosInstance';
import { WorkItem } from '../types/common';

const WORK_ITEMS_BASE_URL = (orgSlug: string, projectId: string) =>
  `${BASE_URL}/orgs/${orgSlug}/projects/${projectId}/work-items`;

export type CreateWorkItem = Pick<WorkItem, 'description' | 'projectId'>;

export const createWorkItem = async (
  orgSlug: string,
  projectId: string,
  data: CreateWorkItem,
): Promise<WorkItem> => {
  try {
    const url = WORK_ITEMS_BASE_URL(orgSlug, projectId);
    const response = await axiosInstance.post<WorkItem>(url, data);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateWorkItem = async (
  orgSlug: string,
  projectId: string,
  updatedWorkItem: WorkItem,
): Promise<WorkItem> => {
  try {
    if (!updatedWorkItem || !updatedWorkItem.id) {
      throw new Error(
        'Invalid work item: updatedWorkItem is undefined or missing an id.',
      );
    }
    const { id, ...workItemWithoutId } = updatedWorkItem;

    delete workItemWithoutId.compiledMessage;
    delete workItemWithoutId.projectId;

    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}/${id}`;

    const response = await axiosInstance.patch<WorkItem>(
      url,
      workItemWithoutId,
    );
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
  data: WorkItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`;

    const response = await axiosInstance.get<{
      data: WorkItem[];
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
    return await axiosInstance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
