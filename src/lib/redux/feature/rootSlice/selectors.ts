import { RootState } from '../../store';

export const selectDescription = (state: RootState) => state.rootUI.description;

export const selectTaskDescription = (state: RootState) =>
  state.rootUI.taskDescription;

export const selectSelectedFiles = (state: RootState) =>
  state.rootUI.selectedFiles;

export const selectSelectedTextBlocks = (state: RootState) =>
  state.rootUI.selectedTextBlocks;
