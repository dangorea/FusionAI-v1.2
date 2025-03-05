import index, { BASE_URL } from '../services/api';
import { OrganizationManagementDataType } from '../lib/redux/feature/user/types';

const ORGANIZATION_MANAGEMENT_URL = `${BASE_URL}/orgs`;

export const fetchOrganizationMembers = async (
  slug: string,
): Promise<OrganizationManagementDataType[]> => {
  try {
    const url = `${ORGANIZATION_MANAGEMENT_URL}/${slug}/members`;
    const response = await index.get<OrganizationManagementDataType[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('[API] GET request failed for members:', error);
    throw error;
  }
};

export const addOrganizationMember = async (
  slug: string,
  newMember: Omit<OrganizationManagementDataType, 'id'>,
): Promise<OrganizationManagementDataType> => {
  try {
    const url = `${ORGANIZATION_MANAGEMENT_URL}/${slug}/members`;
    const response = await index.post<OrganizationManagementDataType>(
      url,
      newMember,
    );
    return response.data;
  } catch (error) {
    console.error('[API] POST request failed for adding member:', error);
    throw error;
  }
};

export const updateOrganizationMemberRole = async (
  slug: string,
  updatedData: Partial<OrganizationManagementDataType>,
): Promise<OrganizationManagementDataType> => {
  try {
    const url = `${ORGANIZATION_MANAGEMENT_URL}/${slug}/members`;
    const response = await index.patch<OrganizationManagementDataType>(
      url,
      updatedData,
    );

    return response.data;
  } catch (error) {
    console.error(
      '[API] PATCH request failed for updating member role:',
      error,
    );
    throw error;
  }
};

export const removeOrganizationMember = async (
  slug: string,
  data: { userId: string },
): Promise<void> => {
  try {
    const url = `${ORGANIZATION_MANAGEMENT_URL}/${slug}/members`;
    await index.delete(url, { data });
  } catch (error) {
    console.error('[API] DELETE request failed for removing member:', error);
    throw error;
  }
};
