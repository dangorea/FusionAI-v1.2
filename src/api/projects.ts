import axiosInstance, { BASE_URL } from './utils/axiosInstance';
import { DataType } from '../types/common';

export const readProjects = async (orgSlug: string): Promise<DataType[]> => {
  try {
    if (!orgSlug || orgSlug === 'default') {
      return [];
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await axiosInstance.get(url);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response structure');
    }
    return response.data.map((project: any) => ({
      id: project.id,
      title: project.title,
      details: project.details,
      organization: project.organization,
    }));
  } catch (error) {
    console.error('[API] GET request failed:', error);
    throw error;
  }
};

export const createProject = async (
  orgSlug: string,
  newProject: Omit<DataType, 'id'>,
): Promise<DataType> => {
  try {
    const url = `${BASE_URL}/orgs/${orgSlug}/projects`;
    const response = await axiosInstance.post<DataType>(url, newProject);
    return { ...response.data };
  } catch (error) {
    console.error('[API] POST request failed:', error);
    throw error;
  }
};

export const updateProject = async (
  orgSlug: string,
  updatedProject: DataType,
): Promise<DataType> => {
  try {
    const { id, ...projectWithoutId } = updatedProject;

    if (!id) {
      console.error('Updated project is missing an ID:', updatedProject);
      throw new Error('Project ID is missing for update.');
    }

    const url = `${BASE_URL}/orgs/${orgSlug}/projects/${id}`;
    const response = await axiosInstance.patch<DataType>(url, projectWithoutId);
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
    await axiosInstance.delete(url);
  } catch (error) {
    console.error('[API] DELETE request failed:', error);
    throw error;
  }
};
