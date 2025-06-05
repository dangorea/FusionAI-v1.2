import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { notification } from 'antd';
import type { FileNode, FileSet, FileTreeProps } from '../../../components';
import { useContextWorkItem } from './useContextWorkItem';
import { useFileBlockFeature } from './useFileBlockFeature';
import { useIterationManagement } from './useIterationManagement';
import {
  selectCodeGenerationState,
  selectSelectedIteration,
} from '../../../lib/redux/feature/artifacts/selectors';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { useTaskDescription } from './useTaskDescription';
import { getIterationFileContent } from '../utils/iteration';
import { useImages } from './useImages';
import { fetchTextBlocks } from '../../../lib/redux/feature/text-blocks/thunk';
import { TextBlockCategory } from '../../../lib/redux/feature/text-blocks/types';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';

export function usePromptGenerator() {
  const { id: workItemId } = useParams();
  const selectedIteration = useAppSelector(selectSelectedIteration);
  const codeGenState = useAppSelector(selectCodeGenerationState);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const projectId = useAppSelector(selectSelectedProjectId);
  const dispatch = useAppDispatch();
  const [sidebarSelectedFiles, setSidebarSelectedFiles] = useState<
    Record<string, string>
  >({});
  const [baseFileSet, setBaseFileSet] = useState<FileSet | null>(null);
  const [generatedFileSet, setGeneratedFileSet] = useState<FileSet | null>(
    null,
  );

  const {
    dropdownProviderRef,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
    bigTaskDescRef,
    bigTaskDescription,
    setBigTaskDescription,
    onBigTaskDescMount,
    disableSendBigTaskDescription,
    smallTaskDescRef,
    smallTaskDescription,
    setSmallTaskDescription,
    disableSmallTaskDescription,
    previewTaskDescRef,
    previewTaskDescriptionPreviewMode,
    setPreviewTaskDescriptionPreviewMode,
    handlePreviewTaskDescMount,
    previewTaskDescription,
    setPreviewTaskDescription,
    disablePreviewTaskDescription,
    setUserIsEditing,
    setHasLocalDescriptionChanged,
    updateTaskDescription,
  } = useTaskDescription();

  const {
    orgSlug,
    isLoading,
    setIsLoading,
    setHasUserModifiedContext,
    projectPath,
    selectedFiles,
    setSelectedFiles,
    selectedRules,
    setSelectedRules,
    onRulesSelected,
    setUserIsEditingContext,
    defaultCheckedKeys,
    updateContextDebounced,
  } = useContextWorkItem();

  const { isFileBlockFeatureEnabled, setIsFileBlockFeatureEnabled } =
    useFileBlockFeature({
      bigTaskDescRef,
      selectedFiles,
    });

  const {
    codeGenExists,
    showCodeViewer,
    setShowCodeViewer,
    forceHideComparisonFileTree,
    unmodifiedFileContent,
    setUnmodifiedFileContent,
    originalFileContent,
    setOriginalFileContent,
    comparisonFileContent,
    setComparisonFileContent,
    selectedFilePath,
    setSelectedFilePath,
    selectedUnmodifiedFilePath,
    setSelectedUnmodifiedFilePath,
    handleHistoryOptionClick,
    handleEditIteration,
    handleSend,
    handleApplyChanges,
    handleClosePreview,
    historyOptions,
  } = useIterationManagement({
    orgSlug,
    workItemId,
    projectPath,
    selectedFiles,
    applySelectedFiles: sidebarSelectedFiles,
    bigTaskDescription,
    setBigTaskDescription,
    smallTaskDescription,
    setSmallTaskDescription,
    bigTaskDescRef,
    smallTaskDescRef,
    previewTaskDescRef,
    previewTaskDescriptionPreviewMode,
    setPreviewTaskDescriptionPreviewMode,
    setPreviewTaskDescription,
    dropdownProviderRef,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
    updateContextDebounced,
    setHasUserModifiedContext,
    setIsLoading,
  });

  const { imageGalleryVisible, showImageGallery, hideImageGallery } =
    useImages();

  useEffect(() => {
    if (!projectPath) return;
    window.fileAPI.watchDirectory(projectPath).catch(() => {});
    const unsub = window.electron.ipcRenderer.on(
      'file-tree-updated',
      (tree: any) => {
        setBaseFileSet({
          id: 'base',
          name: projectPath.split(/[\\/]/).pop() || 'Project',
          tree: tree as FileNode,
          visible: true,
        });
      },
    );
    window?.fileAPI.getFileTree(projectPath).then((initialTree: FileNode) => {
      setBaseFileSet({
        id: 'base',
        name: projectPath.split(/[\\/]/).pop() || 'Project',
        tree: initialTree,
        visible: true,
      });
    });
    return () => unsub();
  }, [projectPath]);

  useEffect(() => {
    if (!org?.slug || !projectId) {
      return;
    }
    dispatch(
      fetchTextBlocks({
        page: 1,
        limit: 100,
        searchTerm: '',
        orgSlug: org.slug,
        blockType: TextBlockCategory.PERSONALITY,
        projectId,
      }),
    )
      .unwrap()
      .catch(() => {
        notification.error({
          message: 'Error Loading Personality Text Blocks',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
    dispatch(
      fetchTextBlocks({
        page: 1,
        limit: 100,
        searchTerm: '',
        orgSlug: org.slug,
        blockType: TextBlockCategory.KNOWLEDGE,
        projectId,
      }),
    )
      .unwrap()
      .catch(() => {
        notification.error({
          message: 'Error Loading Personality Text Blocks',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [org?.slug, projectId, workItemId]);

  useEffect(() => {
    if (!projectPath) return;
    const iterationFiles = selectedIteration
      ? selectedIteration.files
      : codeGenState.latestFiles || {};
    if (iterationFiles) {
      window.fileAPI
        .buildGeneratedFileTree(iterationFiles, projectPath)
        .then((genTree: FileNode) => {
          setGeneratedFileSet({
            id: 'generated',
            name: 'Suggested Changes',
            tree: genTree,
            visible: true,
          });
        })
        .catch(() => {});
    } else {
      setGeneratedFileSet(null);
    }
  }, [projectPath, selectedIteration?.files, selectedIteration, codeGenState]);

  async function handleSidebarMultipleSelect(filePaths: string[]) {
    setUserIsEditingContext(true);
    const loaded = await Promise.all(
      filePaths.map(async (fp) => {
        const content = await window.fileAPI.readFileContent(fp);
        return { fp, content };
      }),
    );
    const dict: Record<string, string> = {};
    loaded.forEach(({ fp, content }) => {
      dict[fp] = content;
    });
    setSidebarSelectedFiles(dict);
  }

  async function handleSidebarSingleSelect(filePath: string) {
    if (!filePath) {
      setSelectedFilePath(undefined);
      setOriginalFileContent('');
      setComparisonFileContent(undefined);
      setShowCodeViewer(false);
      return;
    }
    const originalContent = await window.fileAPI.readFileContent(filePath);
    const generatedContent = getIterationFileContent(
      filePath,
      selectedIteration!.files,
      projectPath,
    );
    if (selectedIteration && generatedContent) {
      setSelectedFilePath(filePath);
      setOriginalFileContent(originalContent);
      setComparisonFileContent(generatedContent);
    } else {
      setSelectedUnmodifiedFilePath(filePath);
      setUnmodifiedFileContent(originalContent);
    }
    setShowCodeViewer(true);
  }

  let fileTreeProps: FileTreeProps = {
    projectPath,
    initialCheckedKeys: defaultCheckedKeys,
  };
  if (baseFileSet) {
    fileTreeProps = {
      fileSets: [baseFileSet, ...(generatedFileSet ? [generatedFileSet] : [])],
      initialCheckedKeys: defaultCheckedKeys,
    };
  }
  const fileTreeSideBarProps: FileTreeProps = {
    projectPath,
    fileSets: [
      ...(baseFileSet ? [baseFileSet] : []),
      ...(generatedFileSet ? [generatedFileSet] : []),
    ],
  };

  async function handleMultipleSelect(filePaths: string[]) {
    setUserIsEditingContext(true);
    setHasUserModifiedContext(true);
    const loaded = await Promise.all(
      filePaths.map(async (fp) => {
        const content = await window.fileAPI.readFileContent(fp);
        return { fp, content };
      }),
    );
    const dict: Record<string, string> = {};
    loaded.forEach(({ fp, content }) => {
      dict[fp] = content;
    });
    setSelectedFiles(dict);
  }

  async function handleSingleSelect(filePath: string) {
    if (!filePath) {
      setSelectedFilePath(undefined);
      setUnmodifiedFileContent('');
      return;
    }
    setHasUserModifiedContext(true);
    const originalContent = await window.fileAPI.readFileContent(filePath);
    setUnmodifiedFileContent(originalContent);
    setSelectedUnmodifiedFilePath(filePath);
  }

  const handleCloseFile = () => {
    handleClosePreview();
    setSelectedFilePath(undefined);
  };

  const errorMessage =
    showCodeViewer &&
    selectedIteration &&
    selectedIteration.files &&
    Object.keys(selectedIteration.files || {}).length === 0
      ? 'No files generated.'
      : '';

  return {
    workItemId,
    isLoading,
    codeGenExists,
    showCodeViewer,
    forceHideComparisonFileTree,
    unmodifiedFileContent,
    setUnmodifiedFileContent,
    originalFileContent,
    comparisonFileContent,
    historyOptions,
    errorMessage,
    bigTaskDescRef,
    smallTaskDescRef,
    previewTaskDescRef,
    dropdownProviderRef,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
    previewTaskDescription,
    selectedFilePath,
    selectedUnmodifiedFilePath,
    fileTreeProps,
    fileTreeSideBarProps,
    selectedRules,
    setSelectedRules,
    handleMultipleSelect,
    handleSingleSelect,
    handleSend,
    handleClosePreview: handleCloseFile,
    handleApplyChanges,
    handleHistoryOptionClick,
    handleEditIteration,
    updateContextDebounced,
    updateTaskDescription,
    onRulesSelected,
    disableSendBigTaskDescription: disableSendBigTaskDescription || isLoading,
    disableSmallTaskDescription: disableSmallTaskDescription || isLoading,
    disablePreviewTaskDescription: disablePreviewTaskDescription || isLoading,
    onBigTaskDescMount,
    setBigTaskDescription,
    setSmallTaskDescription,
    setPreviewTaskDescription,
    handlePreviewTaskDescMount,
    previewTaskDescriptionPreviewMode,
    setPreviewTaskDescriptionPreviewMode,
    setUserIsEditing,
    setHasLocalDescriptionChanged,
    isFileBlockFeatureEnabled,
    setIsFileBlockFeatureEnabled,
    sidebarSelectedFiles,
    handleSidebarMultipleSelect,
    handleSidebarSingleSelect,
    imageGalleryVisible,
    showImageGallery,
    hideImageGallery,
  };
}
