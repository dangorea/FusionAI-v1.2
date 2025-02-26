import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { ProjectDataType } from './types';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (orgSlug: string, { rejectWithValue }) => {
    try {
      // Replace with your actual API call, e.g.:
      // const fetchedProjects = await readProjects(orgSlug);
      // return fetchedProjects.map((project: any) => ({
      //   id: project.id,
      //   title: project.title,
      //   details: project.details,
      //   organization: project.organization,
      // }));
      return [] as ProjectDataType[];
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
