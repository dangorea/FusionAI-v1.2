import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchProjects } from './thunk';
import type { ProjectsState } from './types';
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
    addProject: projectsAdapter.addOne,
    setProjects: projectsAdapter.setAll,
    editProject: projectsAdapter.upsertOne,
    deleteProject: projectsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      projectsAdapter.setAll(state, action.payload);
    });
  },
});

export const {
  setSelectedProjectId,
  addProject,
  setProjects,
  editProject,
  deleteProject,
} = projectsSlice.actions;
export default projectsSlice.reducer;
