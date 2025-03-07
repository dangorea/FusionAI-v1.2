import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RuleType } from '../rules/types';
import type { FileTreeNode, GptFileTreeNode } from '../../../../types/common';

interface RootUIState {
  selectedFiles: string[];
  selectedTextBlocks: RuleType[];
  projectDirectory: string | null;
  fileTree: FileTreeNode | null;
  gptFileTree: GptFileTreeNode[] | null;
  description: string;
  taskDescription: string;
  selectedGptFiles: GptFileTreeNode | null;
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
    setSelectedTextBlocks: (state, action: PayloadAction<RuleType[]>) => {
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

export default rootSlice.reducer;
