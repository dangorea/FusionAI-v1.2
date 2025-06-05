import instance, { BASE_URL } from '../services/api';
import type { TextBlockType } from '../lib/redux/feature/text-blocks/types';

const TEXT_BLOCKS_BASE_URL = (orgSlug: string) =>
  `${BASE_URL}/orgs/${orgSlug}/text-blocks`;

export const readTextBlocks = async (
  orgSlug: string,
  searchTerm: string,
  limit?: number,
  type?: string,
  page: number = 1,
  scope: string = 'project_and_organization',
  projectId?: string,
): Promise<TextBlockType[]> => {
  try {
    if (!orgSlug || orgSlug === 'default') {
      return [];
    }

    let url = `${TEXT_BLOCKS_BASE_URL(orgSlug)}?page=${page}&limit=${limit}`;

    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }

    if (type) {
      url += `&type=${type}`;
    }

    // Add scope parameter (default to PROJECT_AND_ORGANIZATION if not provided)
    url += `&scope=${scope}`;

    // Add projectId parameter if provided
    if (projectId) {
      url += `&projectId=${projectId}`;
    }

    const response = await instance.get(url);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response structure');
    }

    return response.data;
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const createTextBlock = async (
  orgSlug: string,
  newTextBlock: Omit<TextBlockType, 'id'>,
): Promise<TextBlockType> => {
  try {
    const url = TEXT_BLOCKS_BASE_URL(orgSlug);
    const response = await instance.post<TextBlockType>(url, newTextBlock);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateTextBlock = async (
  orgSlug: string,
  updatedTextBlock: TextBlockType,
): Promise<TextBlockType> => {
  try {
    const { id, ...textBlockWithoutId } = updatedTextBlock;
    const url = `${TEXT_BLOCKS_BASE_URL(orgSlug)}/${id}`;
    const response = await instance.patch<TextBlockType>(
      url,
      textBlockWithoutId,
    );
    return response.data;
  } catch (error) {
    console.error('[API] patch request failed:', error);
    throw error;
  }
};

export const deleteTextBlock = async (
  orgSlug: string,
  id: string,
): Promise<void> => {
  try {
    const url = `${TEXT_BLOCKS_BASE_URL(orgSlug)}/${id}`;
    await instance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
