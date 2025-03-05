import index, { BASE_URL } from '../services/api';
import { OrganizationType } from '../domains/organization/model/types';

const ORGANIZATION_BLOCKS_URL = `${BASE_URL}/orgs`;

export const readOrganizationBlocks = async (): Promise<OrganizationType[]> => {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    const response = await index.get<OrganizationType[]>(
      ORGANIZATION_BLOCKS_URL,
    );
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
    const response = await index.post<OrganizationType>(
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
  updatedOrganizationBlock: OrganizationType,
  previousSlug: string,
): Promise<OrganizationType> => {
  try {
    const url = `${ORGANIZATION_BLOCKS_URL}/${previousSlug}`;

    const response = await index.patch<OrganizationType>(
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
    await index.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
