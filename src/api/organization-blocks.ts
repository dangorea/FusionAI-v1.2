import instance, { BASE_URL } from '../services/api';
import type { OrganizationType } from '../domains/organization/model/types';

const ORGANIZATION_BLOCKS_URL = `${BASE_URL}/orgs`;

export const readOrganizationBlocks = async (
  page: number,
  limit: number,
  searchTerm?: string,
): Promise<OrganizationType[]> => {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    const url = `${ORGANIZATION_BLOCKS_URL}?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`;

    const response = await instance.get<OrganizationType[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const createOrganizationBlock = async (
  newOrganizationBlock: Omit<OrganizationType, 'id'>,
): Promise<OrganizationType> => {
  try {
    const response = await instance.post<OrganizationType>(
      ORGANIZATION_BLOCKS_URL,
      newOrganizationBlock,
    );
    return { ...response.data };
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateOrganizationBlock = async (
  updatedOrganizationBlock: Partial<OrganizationType>,
  previousSlug: string,
): Promise<OrganizationType> => {
  try {
    const url = `${ORGANIZATION_BLOCKS_URL}/${previousSlug}`;

    const response = await instance.patch<OrganizationType>(
      url,
      updatedOrganizationBlock,
    );

    return response.data;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

export const deleteOrganizationBlock = async (slug: string): Promise<void> => {
  try {
    const url = `${ORGANIZATION_BLOCKS_URL}/${slug}`;
    await instance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const { data } = await instance.get<{ available: boolean }>(
    '/orgs/check-slug',
    { params: { slug } },
  );
  return data.available;
}
