import type { InvitationType } from '../domains/settings/model/types';
import instance, { BASE_URL } from '../services/api';

export const getUserInvitations = async (): Promise<InvitationType[]> => {
  try {
    const { data } = await instance.get<InvitationType[]>(
      `${BASE_URL}/invitations/user`,
    );
    return data;
  } catch (error) {
    console.error('[API] GET /invitations/user failed:', error);
    throw error;
  }
};

export const acceptInvitation = async (id: string): Promise<void> => {
  try {
    await instance.post(`${BASE_URL}/invitations/${id}/accept`);
  } catch (error) {
    console.error(`[API] POST /invitations/${id}/accept failed:`, error);
    throw error;
  }
};

export const declineInvitation = async (id: string): Promise<void> => {
  try {
    await instance.post(`${BASE_URL}/invitations/${id}/decline`);
  } catch (error) {
    console.error(`[API] POST /invitations/${id}/decline failed:`, error);
    throw error;
  }
};
