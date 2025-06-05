import type { ContextType } from '../lib/redux/feature/context/types';
import instance from '../services/api';

/**
 * Retrieves a context by ID.
 */
export const getContext = async (
  contextId: string,
  orgSlug: string,
  projectId: string,
): Promise<ContextType> => {
  const response = await instance.get(
    `/orgs/${orgSlug}/projects/${projectId}/context/${contextId}`,
  );
  return response.data;
};

/**
 * Updated to accept an optional AbortSignal (signal?) for cancellation.
 */
export const updateContext = async (
  contextId: string,
  orgSlug: string,
  projectId: string,
  updateData: Partial<
    ContextType & { textBlockIds: string[]; imageIds: string[] }
  >,
  signal?: AbortSignal,
): Promise<ContextType> => {
  const response = await instance.patch(
    `/orgs/${orgSlug}/projects/${projectId}/context/${contextId}`,
    updateData,
    {
      signal,
    },
  );
  return response.data;
};

/**
 * Add images to a context
 */
export const addImagesToContext = async (
  contextId: string,
  orgSlug: string,
  projectId: string,
  imageIds: string[],
): Promise<ContextType> => {
  const response = await instance.post(
    `/orgs/${orgSlug}/projects/${projectId}/context/${contextId}/images`,
    {
      imageIds,
    },
  );
  return response.data;
};

/**
 * Deletes a context by ID.
 */
export const deleteContext = async (
  contextId: string,
  orgSlug: string,
  projectId: string,
): Promise<void> => {
  await instance.delete(
    `/orgs/${orgSlug}/projects/${projectId}/context/${contextId}`,
  );
};
