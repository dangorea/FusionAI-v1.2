import instance, { BASE_URL } from '../services/api';
import type { OrganizationManagementDataType } from '../lib/redux/feature/organization-management/types';

const ORGANIZATION_MANAGEMENT_URL = `${BASE_URL}/orgs`;

export const fetchOrganizationMembers = async (
  orgSlug: string,
  page: number,
  limit: number,
  searchTerm: string,
): Promise<OrganizationManagementDataType[]> => {
  try {
    if (!orgSlug) {
      return [];
    }

    const url = `${ORGANIZATION_MANAGEMENT_URL}/${orgSlug}/members?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`;

    const response = await instance.get<OrganizationManagementDataType[]>(url);
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
    const response = await instance.post<OrganizationManagementDataType>(
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
    const response = await instance.patch<OrganizationManagementDataType>(
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
  data: { email: string },
): Promise<void> => {
  try {
    const url = `${ORGANIZATION_MANAGEMENT_URL}/${slug}/members`;
    await instance.delete(url, { data });
  } catch (error) {
    console.error('[API] DELETE request failed for removing member:', error);
    throw error;
  }
};

// export const createInvitation = async (
//   orgSlug: string,
//   invitationData: { email: string; roles: string[] },
// ): Promise<InvitationResponseDto> => {
//   const url = `${BASE_URL}/invitations/${orgSlug}/create`;
//   const response = await instance.post<InvitationResponseDto>(
//     url,
//     invitationData,
//   );
//   return response.data;
// };

export const createInvitation = async (
  slug: string,
  invitationData: { email: string; roles: string[] },
) => {
  const url = `${BASE_URL}/invitations/${slug}/create`;
  const response = await instance.post(url, invitationData);
  return response.data;
};
