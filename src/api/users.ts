import type { User } from '../lib/redux/feature/user/types';
import instance, { BASE_URL } from '../services/api';

export const registerUser = async (tokenData: {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
}): Promise<User> => {
  try {
    const url = `${BASE_URL}/users/register`;
    const response = await instance.post(url, tokenData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (!response.data) {
      throw new Error('Failed to register user');
    }
    return response.data as User;
  } catch (error) {
    console.error('[API] POST /users/register failed:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const url = `${BASE_URL}/users/me`;
    const response = await instance.get(url);
    if (!response.data) {
      throw new Error('Failed to fetch current user');
    }
    return response.data as User;
  } catch (error) {
    console.error('[API] GET /users/me failed:', error);
    throw error;
  }
};

export const updateCurrentUser = async (
  updateUserDto: Partial<User>,
): Promise<User> => {
  try {
    const url = `${BASE_URL}/users/me`;
    const response = await instance.patch(url, updateUserDto);
    if (!response.data) {
      throw new Error('Failed to update user');
    }
    return response.data as User;
  } catch (error) {
    console.error('[API] PATCH /users/me failed:', error);
    throw error;
  }
};
