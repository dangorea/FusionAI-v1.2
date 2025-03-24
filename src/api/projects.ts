import instance, { BASE_URL } from '../services/api';
import type { ProjectType } from '../domains/project/model/type';

export const readProjects = async (orgSlug: string): Promise<ProjectType[]> => {
  try {
    if (!orgSlug) {
      return [];
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await instance.get(url);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response structure');
    }
    return response.data;
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const createProject = async (
  orgSlug: string,
  newProject: Pick<ProjectType, 'name' | 'description'>,
): Promise<ProjectType> => {
  try {
    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await instance.post<ProjectType>(url, newProject);
    return { ...response.data };
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateProject = async (
  orgSlug: string,
  updatedProject: Pick<ProjectType, 'id' | 'name' | 'description'>,
): Promise<ProjectType> => {
  try {
    const { id, ...projectWithoutId } = updatedProject;

    if (!id) {
      console.error('Updated project is missing an ID:', updatedProject);
      throw new Error('Project ID is missing for update.');
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects/${id}`;
    const response = await instance.patch<ProjectType>(url, projectWithoutId);
    return response.data;
  } catch (error) {
    console.error('[API] PATCH request failed:', error);
    throw error;
  }
};

export const deleteProject = async (
  orgSlug: string,
  id: string,
): Promise<void> => {
  try {
    if (!id) {
      throw new Error('Project ID is missing for delete.');
    }
    const url = `${BASE_URL}/orgs/${orgSlug}/projects/${id}`;
    await instance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
