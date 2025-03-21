import instance from '../services/api';
import type { CodeGenerationType, LLMProvider } from '../types/common';

/**
 * Sends a code generation request to the API
 * @param data Object containing the prompt for code generation
 * @returns The API response data
 * @throws Error if the API request fails
 */
export async function codeGeneration(data: { prompt: string }) {
  try {
    const response = await instance.post('/code-generation', data);
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
export async function getCodeGenerationSession(
  id: string,
): Promise<CodeGenerationType> {
  try {
    const response = await instance.get(`/code-generation/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error in get code generation session request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to retrieve code generation session from API');
  }
}

/**
 * Retrieves a specific code generation session by ID
 * @param id The unique identifier of the code generation session
 * @param data Object containing the prompt for adding a new iteration
 * @returns The code generation session data
 * @throws Error if the API request fails
 */
export async function addIterationAPI(
  id: string,
  data: {
    prompt: string;
    startFromIterationId: string;
    provider: string;
  },
): Promise<CodeGenerationType> {
  try {
    const response = await instance.post(
      `/code-generation/${id}/iterations`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error in addIterationAPI:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to add iteration to code generation API');
  }
}

/**
 * Retrieves a specific LLMs providers
 * @returns The LLMs providers
 * @throws Error if the API request fails
 */
export async function getProvider(): Promise<LLMProvider[]> {
  try {
    const response = await instance.get(`/code-generation/providers`);
    return response.data;
  } catch (error: any) {
    console.error('Error in get code generation session request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to retrieve code generation session from API');
  }
}
