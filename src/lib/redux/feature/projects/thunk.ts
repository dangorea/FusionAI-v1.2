import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { ProjectDataType } from './types';
import { readProjects } from '../../../../api/projects';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      const fetchedProjects = await readProjects(orgSlug);

      const transformedProjects: ProjectDataType[] = fetchedProjects.map(
        (project: any) => ({
          id: project.id,
          title: project.title,
          details: project.details,
          organization: project.organization,
        }),
      );

      return transformedProjects;
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
