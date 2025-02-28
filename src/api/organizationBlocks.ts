import axiosInstance, { BASE_URL } from './utils/axiosInstance';
import { OrganizationBlockDataType } from '../lib/redux/feature/organization/types';

const ORGANIZATION_BLOCKS_URL = `${BASE_URL}/orgs`;

export const readOrganizationBlocks = async (): Promise<
  OrganizationBlockDataType[]
> => {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    const response = await axiosInstance.get<OrganizationBlockDataType[]>(
      ORGANIZATION_BLOCKS_URL,
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const createOrganizationBlock = async (
  newOrganizationBlock: Omit<OrganizationBlockDataType, 'id'>,
): Promise<OrganizationBlockDataType> => {
  try {
    const response = await axiosInstance.post<OrganizationBlockDataType>(
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
  updatedOrganizationBlock: OrganizationBlockDataType,
  previousSlug: string,
): Promise<OrganizationBlockDataType> => {
  try {
    const url = `${ORGANIZATION_BLOCKS_URL}/${previousSlug}`;

    const response = await axiosInstance.patch<OrganizationBlockDataType>(
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
    await axiosInstance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
