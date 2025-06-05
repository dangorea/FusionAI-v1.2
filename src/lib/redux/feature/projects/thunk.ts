import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  createProject,
  deleteProject as apiDeleteProject,
  readProjects,
  updateProject,
} from '../../../../api/projects';
import type { ProjectType } from '../../../../domains/project/model/type';

export const fetchProjects = createAsyncThunk<
  ProjectType[],
  { orgSlug: string; page: number; limit: number; searchTerm?: string }
>(
  'projects/fetchProjects',
  async ({ orgSlug, page, limit, searchTerm = '' }, { rejectWithValue }) => {
    try {
      return await readProjects(orgSlug, page, limit, searchTerm);
    } catch (error) {
      console.error('[Thunk] Failed to fetch projects:', error);
      notification.error({ message: 'Failed to Fetch Projects' });
      return rejectWithValue(error);
    }
  },
);

export const createProjectThunk = createAsyncThunk<
  ProjectType,
  { orgSlug: string; newProject: Pick<ProjectType, 'name' | 'description'> }
>(
  'projects/createProject',
  async ({ orgSlug, newProject }, { rejectWithValue }) => {
    try {
      const createdProject = await createProject(orgSlug, newProject);
      notification.success({
        message: 'Project Added',
        description: `Project "${createdProject.name}" created successfully!`,
      });
      return createdProject;
    } catch (error) {
      console.error('[Thunk] Failed to create project:', error);
      notification.error({ message: 'Failed to Add Project' });
      return rejectWithValue(error);
    }
  },
);

export const updateProjectThunk = createAsyncThunk<
  ProjectType,
  {
    orgSlug: string;
    updatedProject: Partial<Pick<ProjectType, 'id' | 'name' | 'description'>>;
  }
>(
  'projects/updateProject',
  async ({ orgSlug, updatedProject }, { rejectWithValue }) => {
    try {
      if (!updatedProject.id) throw new Error('Missing project ID for update.');

      const response = await updateProject(orgSlug, updatedProject);
      notification.success({
        message: 'Project Updated',
        description: `Project "${response.name}" updated successfully!`,
      });
      return response;
    } catch (error) {
      console.error('[Thunk] Failed to update project:', error);
      notification.error({ message: 'Failed to Update Project' });
      return rejectWithValue(error);
    }
  },
);

export const deleteProjectThunk = createAsyncThunk<
  string,
  { orgSlug: string; projectId: string }
>(
  'projects/deleteProject',
  async ({ orgSlug, projectId }, { rejectWithValue }) => {
    try {
      await apiDeleteProject(orgSlug, projectId);
      notification.success({ message: 'Selected Project Deleted' });
      return projectId;
    } catch (error) {
      console.error('[Thunk] Failed to delete project:', error);
      notification.error({ message: 'Failed to Delete Selected Project' });
      return rejectWithValue(error);
    }
  },
);
