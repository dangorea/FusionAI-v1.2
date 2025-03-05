import index, { BASE_URL } from '../services/api';
import { WorkItemType } from '../domains/work-item/model/types';

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
    const response = await index.post<WorkItemType>(url, data);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

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

    delete workItemWithoutId.compiledMessage;
    delete (workItemWithoutId as Partial<WorkItemType>).projectId;

    const url = `${WORK_ITEMS_BASE_URL(orgSlug, projectId)}/${id}`;

    const response = await index.patch<WorkItemType>(url, workItemWithoutId);
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

    const response = await index.get<{
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
    return await index.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
