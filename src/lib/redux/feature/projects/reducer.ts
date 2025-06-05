import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProjectsState } from './types';
import {
  createProjectThunk,
  deleteProjectThunk,
  fetchProjects,
  updateProjectThunk,
} from './thunk';
import { projectsAdapter } from './adapter';
import { PROJECTS_REDUCER_NAME } from '../../reducer-constant';

const initialState: ProjectsState = projectsAdapter.getInitialState({
  selectedProjectId: null,
});

const projectsSlice = createSlice({
  name: PROJECTS_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedProjectId(state, action: PayloadAction<string | null>) {
      state.selectedProjectId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      projectsAdapter.setAll(state, action.payload);
    });
    builder.addCase(createProjectThunk.fulfilled, (state, action) => {
      projectsAdapter.addOne(state, action.payload);
    });
    builder.addCase(updateProjectThunk.fulfilled, (state, action) => {
      projectsAdapter.upsertOne(state, action.payload);
    });
    builder.addCase(deleteProjectThunk.fulfilled, (state, action) => {
      projectsAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setSelectedProjectId } = projectsSlice.actions;
export default projectsSlice.reducer;
