import instance, { BASE_URL } from '../services/api';
import type { LLMProvider } from '../types/common';
import type { GenerationType } from '../lib/redux/feature/artifacts/types';

const AI_CODER_BASE_URL = (orgSlug: string, projectId: string) =>
  `${BASE_URL}/orgs/${orgSlug}/projects/${projectId}/ai-agents/ai-coder`;

/**
 * Retrieves available LLM providers
 * @returns The LLM providers
 * @throws Error if the API request fails
 */
export async function getProviders(
  orgSlug: string,
  projectId: string,
): Promise<LLMProvider[]> {
  try {
    const response = await instance.get(AI_CODER_BASE_URL(orgSlug, projectId));
    return response.data.providers;
  } catch (error: any) {
    console.error('Error in get providers request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to retrieve providers from API');
  }
}

/**
 * Retrieves a specific code generation session by ID
 * @param orgSlug
 * @param projectId
 * @param data Object containing the prompt for adding a new iteration
 * @returns The code generation session data
 * @throws Error if the API request fails
 */
export async function aiCoderExecute(
  orgSlug: string,
  projectId: string,
  data: Partial<{
    workItemId: string;
    artifactId: string;
    artifactIterationId: string;
    prompt: string;
    provider: string;
    personalityIds?: string[];
  }>,
): Promise<GenerationType> {
  try {
    const url = AI_CODER_BASE_URL(orgSlug, projectId);
    const response = await instance.post<GenerationType>(`${url}/execute`, {
      options: {
        ...data,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error in addIterationAPI:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to add iteration to code generation API');
  }
}
