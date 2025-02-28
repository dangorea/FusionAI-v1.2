import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TextBlockDataType } from '../text-blocks/types';
import { GptFileTreeNode } from '../../../../state/types';
import { FileTreeNode } from '../../../../ipc';
import { RootState } from '../../store';

interface RootUIState {
  selectedFiles: string[];
  selectedTextBlocks: TextBlockDataType[];
  projectDirectory: string | null;
  fileTree: FileTreeNode | null;
  gptFileTree: GptFileTreeNode[] | null;
  description: string;
  taskDescription: string;
  selectedGptFiles: GptFileTreeNode | null;
  // ... etc.
}

const initialState: RootUIState = {
  selectedFiles: [],
  selectedTextBlocks: [],
  projectDirectory: null,
  fileTree: null,
  gptFileTree: null,
  description: '',
  taskDescription: '',
  selectedGptFiles: null,
};

export const rootSlice = createSlice({
  name: 'rootUI',
  initialState,
  reducers: {
    setSelectedFiles: (state, action: PayloadAction<string[]>) => {
      state.selectedFiles = action.payload;
    },
    setSelectedTextBlocks: (
      state,
      action: PayloadAction<TextBlockDataType[]>,
    ) => {
      state.selectedTextBlocks = action.payload;
    },
    setProjectDirectory: (state, action: PayloadAction<string | null>) => {
      state.projectDirectory = action.payload;
    },
    setFileTree: (state, action: PayloadAction<FileTreeNode | null>) => {
      state.fileTree = action.payload;
    },
    setGptFileTree: (
      state,
      action: PayloadAction<GptFileTreeNode[] | null>,
    ) => {
      state.gptFileTree = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setTaskDescription: (state, action: PayloadAction<string>) => {
      state.taskDescription = action.payload;
    },
    setSelectedGptFiles: (
      state,
      action: PayloadAction<GptFileTreeNode | null>,
    ) => {
      state.selectedGptFiles = action.payload;
    },
  },
});

export const {
  setSelectedFiles,
  setSelectedTextBlocks,
  setProjectDirectory,
  setFileTree,
  setGptFileTree,
  setDescription,
  setTaskDescription,
  setSelectedGptFiles,
} = rootSlice.actions;

export const selectDescription = (state: RootState) => state.rootUI.description;

export const selectTaskDescription = (state: RootState) =>
  state.rootUI.taskDescription;

export const selectSelectedFiles = (state: RootState) =>
  state.rootUI.selectedFiles;

export const selectSelectedTextBlocks = (state: RootState) =>
  state.rootUI.selectedTextBlocks;

export default rootSlice.reducer;
