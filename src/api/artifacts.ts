import instance from '../services/api';
import type { ArtifactType } from '../lib/redux/feature/artifacts/types';

/**
 * Sends a code generation request to the API
 * @param data Object containing the prompt for code generation
 * @returns The API response data
 * @throws Error if the API request fails
 */
export async function createCodeArtifact(data: {
  prompt: string;
  provider?: string;
}) {
  try {
    const response = await instance.post('/artifacts', data);
    return response.data;
  } catch (error: any) {
    console.error('Error in code generation request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to send code generation request to API');
  }
}

/**
 * Retrieves a specific code generation session by ID
 * @param id The unique identifier of the code generation session
 * @returns The code generation session data
 * @throws Error if the API request fails
 */
export async function getCodeArtifactById(id: string): Promise<ArtifactType> {
  try {
    const response = await instance.get<ArtifactType>(`/artifacts/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error in get code generation session request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to retrieve code generation session from API');
  }
}
