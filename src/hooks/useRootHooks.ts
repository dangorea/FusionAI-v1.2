import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../lib/redux/hook';

import {
  setDescription,
  setFileTree,
  setGptFileTree,
  setProjectDirectory,
  setSelectedFiles,
  setSelectedGptFiles,
  setSelectedTextBlocks,
  setTaskDescription,
} from '../lib/redux/feature/rootSlice/reducer';
// For the Work Items from Redux:
import { selectEditingWorkItemEntity } from '../lib/redux/feature/work-items/selectors';

// Example type from your code
import { FileTreeNode } from '../ipc';
import { TextBlockDataType } from '../lib/redux/feature/text-blocks/types';
import { GptFileTreeNode } from '../types/common';
import { updateWorkItemThunk } from '../lib/redux/feature/work-items/thunk';

/**
 * Toggle selected files in Redux + optionally update the editingWorkItem
 */
export const useToggleSelectedFiles = (currentSelectedFiles: string[]) => {
  const dispatch = useAppDispatch();
  const editingWorkItem = useAppSelector(selectEditingWorkItemEntity);

  useEffect(() => {
    if (editingWorkItem?.id && editingWorkItem.sourceFiles) {
      const restoredFiles = editingWorkItem.sourceFiles.map((sf) => sf.path);
      dispatch(setSelectedFiles(restoredFiles));
    } else {
      dispatch(setSelectedFiles([]));
    }
  }, [editingWorkItem?.id, editingWorkItem?.sourceFiles, dispatch]);

  return (filesToToggle: string[]) => {
    const unique = new Set(currentSelectedFiles);
    filesToToggle.forEach((file) => {
      if (unique.has(file)) unique.delete(file);
      else unique.add(file);
    });
    const updatedFiles = Array.from(unique);
    dispatch(setSelectedFiles(updatedFiles));

    if (editingWorkItem?.id) {
      const updatedWorkItem = {
        ...editingWorkItem,
        sourceFiles: updatedFiles.map((path) => ({ path })),
      };

      dispatch(updateWorkItemThunk(updatedWorkItem));
    }
  };
};

/**
 * Toggle selected text blocks in Redux + optionally update editingWorkItem
 */
export const useToggleSelectedTextBlocks = (
  currentTextBlocks: TextBlockDataType[],
) => {
  const dispatch = useAppDispatch();
  const editingWorkItem = useAppSelector(selectEditingWorkItemEntity);

  useEffect(() => {
    if (editingWorkItem?.textBlocks) {
      dispatch(setSelectedTextBlocks(editingWorkItem.textBlocks));
    }
  }, [editingWorkItem?.textBlocks, dispatch]);

  return (updatedBlocks: TextBlockDataType[]) => {
    dispatch(setSelectedTextBlocks(updatedBlocks));

    if (editingWorkItem?.id) {
      const newWorkItem = {
        ...editingWorkItem,
        textBlocks: updatedBlocks.map((block) => ({
          id: block.id,
          title: block.title,
          details: block.details,
        })),
      };
      dispatch(updateWorkItemThunk(newWorkItem));
    }
  };
};

/**
 * Set project directory in Redux
 */
export const useSetProjectDirectory = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (directory: string | null) => {
      dispatch(setProjectDirectory(directory));
    },
    [dispatch],
  );
};

/**
 * Set file tree in Redux
 */
export const useSetFileTree = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (fileTree: FileTreeNode | null) => {
      dispatch(setFileTree(fileTree));
    },
    [dispatch],
  );
};

/**
 * Set GPT file tree in Redux
 */
export const useSetGptFileTree = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (gptFileTree: GptFileTreeNode[] | null) => {
      dispatch(setGptFileTree(gptFileTree));
    },
    [dispatch],
  );
};

/**
 * Toggle GPT selected files in Redux
 */
export const useToggleGptSelectedFiles = (
  selectedGptFiles: GptFileTreeNode,
) => {
  const dispatch = useAppDispatch();
  return useCallback(
    (gptfile: GptFileTreeNode | null) => {
      dispatch(setSelectedGptFiles(gptfile));
    },
    [dispatch],
  );
};

/**
 * Set main description in Redux + optionally update editingWorkItem
 */
export const useSetDescription = () => {
  const dispatch = useAppDispatch();
  const editingWorkItem = useAppSelector(selectEditingWorkItemEntity);

  return useCallback(
    (description: string) => {
      dispatch(setDescription(description));
      if (editingWorkItem?.id) {
        const newWorkItem = {
          ...editingWorkItem,
          description,
        };

        dispatch(updateWorkItemThunk(newWorkItem));
      }
    },
    [dispatch, editingWorkItem],
  );
};

/**
 * Set task description in Redux + optionally update editingWorkItem
 */
export const useSetTaskDescription = () => {
  const dispatch = useAppDispatch();
  const editingWorkItem = useAppSelector(selectEditingWorkItemEntity);

  return useCallback(
    (taskDescription: string) => {
      dispatch(setTaskDescription(taskDescription));
      if (editingWorkItem?.id) {
        const newWorkItem = {
          ...editingWorkItem,
          taskDescription,
        };
        dispatch(updateWorkItemThunk(newWorkItem));
      }
    },
    [dispatch, editingWorkItem],
  );
};
