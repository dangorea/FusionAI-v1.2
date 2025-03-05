import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  createProject,
  deleteProject as apiDeleteProject,
  readProjects,
  updateProject,
} from '../../../../api/projects';
import { ProjectType } from '../../../../domains/project/model/type';
import {
  addProject,
  deleteProject as removeProject,
  editProject,
} from './reducer';

// Already existing fetchProjects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      return await readProjects(orgSlug);
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch projects:', error);
      notification.error({
        message: 'Failed to Fetch Projects',
        description: 'There was an issue fetching projects from the server.',
      });
      return rejectWithValue(error);
    }
  },
);

/**
 * Create a new project
 */
export const createProjectThunk = createAsyncThunk(
  'projects/createProject',
  async (
    {
      orgSlug,
      newProject,
    }: {
      orgSlug: string;
      newProject: Pick<ProjectType, 'title' | 'details'>;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const createdProject = await createProject(orgSlug, newProject);
      // Update store
      dispatch(addProject(createdProject));

      // Optional success notification here (or you can handle in component)
      notification.success({
        message: 'Project Added',
        description: `Project "${createdProject.title}" created successfully!`,
      });

      return createdProject;
    } catch (error) {
      console.error('[Thunk] Failed to create project:', error);
      notification.error({
        message: 'Failed to Add Project',
      });
      return rejectWithValue(error);
    }
  },
);

/**
 * Update an existing project
 */
export const updateProjectThunk = createAsyncThunk(
  'projects/updateProject',
  async (
    {
      orgSlug,
      updatedProject,
    }: {
      orgSlug: string;
      updatedProject: Pick<ProjectType, 'id' | 'title' | 'details'>;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (!updatedProject.id) {
        throw new Error('Missing project ID for update.');
      }

      const response = await updateProject(orgSlug, updatedProject);
      // Update store
      dispatch(editProject(response));

      // Optional success notification here (or you can handle in component)
      notification.success({
        message: 'Project Updated',
        description: `Project "${response.title}" updated successfully!`,
      });

      return response;
    } catch (error) {
      console.error('[Thunk] Failed to update project:', error);
      notification.error({
        message: 'Failed to Update Project',
      });
      return rejectWithValue(error);
    }
  },
);

/**
 * Delete multiple projects (based on selected project IDs)
 */
export const deleteProjectsThunk = createAsyncThunk(
  'projects/deleteProjects',
  async (
    {
      orgSlug,
      projectIds,
    }: {
      orgSlug: string;
      projectIds: string[];
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      // Delete all in parallel
      await Promise.all(projectIds.map((id) => apiDeleteProject(orgSlug, id)));

      // Remove from store
      projectIds.forEach((id) => dispatch(removeProject(id)));

      // Optional success notification here (or you can handle in component)
      notification.success({
        message: 'Selected Projects Deleted',
      });

      return projectIds;
    } catch (error) {
      console.error('[Thunk] Failed to delete projects:', error);
      notification.error({
        message: 'Failed to Delete Selected Projects',
      });
      return rejectWithValue(error);
    }
  },
);
