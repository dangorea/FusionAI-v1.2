import instance, { BASE_URL } from '../services/api';
import type { RuleType } from '../lib/redux/feature/rules/types';

const TEXT_BLOCKS_BASE_URL = (orgSlug: string) =>
  `${BASE_URL}/orgs/${orgSlug}/text-blocks`;

export const readTextBlocks = async (orgSlug: string): Promise<RuleType[]> => {
  try {
    if (!orgSlug || orgSlug === 'default') {
      return [];
    }
    const url = `${BASE_URL}/orgs/${orgSlug}/text-blocks`;

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
  newTextBlock: Omit<RuleType, 'id'>,
): Promise<RuleType> => {
  try {
    const url = TEXT_BLOCKS_BASE_URL(orgSlug);
    const response = await instance.post<RuleType>(url, newTextBlock);
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateTextBlock = async (
  orgSlug: string,
  updatedTextBlock: RuleType,
): Promise<RuleType> => {
  try {
    const { id, ...textBlockWithoutId } = updatedTextBlock;
    const url = `${TEXT_BLOCKS_BASE_URL(orgSlug)}/${id}`;
    const response = await instance.patch<RuleType>(url, textBlockWithoutId);
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
