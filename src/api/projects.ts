import index, { BASE_URL } from '../services/api';
import { ProjectType } from '../domains/project/model/type';

export const readProjects = async (orgSlug: string): Promise<ProjectType[]> => {
  try {
    if (!orgSlug || orgSlug === 'default') {
      return [];
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await index.get(url);

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
  newProject: Pick<ProjectType, 'title' | 'details'>,
): Promise<ProjectType> => {
  try {
    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await index.post<ProjectType>(url, newProject);
    return { ...response.data };
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateProject = async (
  orgSlug: string,
  updatedProject: Pick<ProjectType, 'id' | 'title' | 'details'>,
): Promise<ProjectType> => {
  try {
    const { id, ...projectWithoutId } = updatedProject;

    if (!id) {
      console.error('Updated project is missing an ID:', updatedProject);
      throw new Error('Project ID is missing for update.');
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects/${id}`;
    const response = await index.patch<ProjectType>(url, projectWithoutId);
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
    await index.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
