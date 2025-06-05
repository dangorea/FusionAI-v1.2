import type { Dispatch, RefObject, SetStateAction } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { notification, Spin } from 'antd';
import type { DebouncedFunc, DebouncedFuncLeading } from 'lodash';
import path from 'path-browserify';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  getIterationById,
  selectCodeGenerationSelectedIterationId,
  selectCodeGenerationState,
  selectSelectedIteration,
} from '../../../lib/redux/feature/artifacts/selectors';
import { updateSelectedIteration } from '../../../lib/redux/feature/artifacts/reducer';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import type { DropdownRef, ListOption } from '../../../components';
import type { TaskDescriptionInputRef } from '../components';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import {
  buildIterationsHistory,
  extractIterationLabel,
} from '../utils/iteration';
import { getAbsoluteFilePath, getRelativePath } from '../utils/path';
import { clearLocalCodeGenerationId } from '../../../lib/redux/feature/work-items/reducer';
import { executeAICoder } from '../../../lib/redux/feature/artifacts/thunk';

interface UseIterationManagementParams {
  orgSlug?: string;
  projectId?: string;
  workItemId?: string;
  bigTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  smallTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  previewTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  dropdownProviderRef: RefObject<DropdownRef | null>;
  personalityDropdownHeaderRef: RefObject<DropdownRef | null>;
  personalityDropdownContentRef: RefObject<DropdownRef | null>;
  personalityDropdownFooterRef: RefObject<DropdownRef | null>;
  projectPath: string;
  selectedFiles: Record<string, string>;
  applySelectedFiles: Record<string, string>;
  smallTaskDescription: string;
  setSmallTaskDescription: Dispatch<SetStateAction<string>>;
  bigTaskDescription: string;
  setBigTaskDescription: Dispatch<SetStateAction<string>>;
  setHasUserModifiedContext: Dispatch<SetStateAction<boolean>>;
  updateContextDebounced:
    | DebouncedFuncLeading<() => Promise<void>>
    | DebouncedFunc<() => Promise<void>>;
  previewTaskDescriptionPreviewMode: boolean;
  setPreviewTaskDescriptionPreviewMode: Dispatch<SetStateAction<boolean>>;
  setPreviewTaskDescription: Dispatch<SetStateAction<string>>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
}

interface UseIterationManagementReturn {
  codeGenExists: boolean;
  showCodeViewer: boolean;
  setShowCodeViewer: Dispatch<SetStateAction<boolean>>;
  forceHideComparisonFileTree: boolean;
  unmodifiedFileContent: string;
  setUnmodifiedFileContent: Dispatch<SetStateAction<string>>;
  originalFileContent: string;
  setOriginalFileContent: Dispatch<SetStateAction<string>>;
  comparisonFileContent?: string;
  setComparisonFileContent: Dispatch<SetStateAction<string | undefined>>;
  selectedFilePath?: string;
  setSelectedFilePath: Dispatch<SetStateAction<string | undefined>>;
  selectedUnmodifiedFilePath?: string;
  setSelectedUnmodifiedFilePath: Dispatch<SetStateAction<string | undefined>>;
  historyOptions: ListOption[];
  handleHistoryOptionClick: (option: ListOption) => Promise<void>;
  handleEditIteration: () => Promise<void>;
  handleSend: () => Promise<void>;
  handleApplyChanges: () => Promise<void>;
  handleClosePreview: () => void;
}

export function useIterationManagement(
  params: UseIterationManagementParams,
): UseIterationManagementReturn {
  const {
    orgSlug,
    workItemId,
    projectPath,
    applySelectedFiles,
    setSmallTaskDescription,
    setBigTaskDescription,
    setHasUserModifiedContext,
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
    setIsLoading,
  } = params;

  const personalityRefs = [
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
  ];

  const dispatch = useAppDispatch();
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const codeGenState = useAppSelector(selectCodeGenerationState);
  const selectedIteration = useAppSelector(selectSelectedIteration);
  const selectedIterationId = useAppSelector(
    selectCodeGenerationSelectedIterationId,
  );
  const projectId = useAppSelector(selectSelectedProjectId);
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [forceHideComparisonFileTree, setForceHideComparisonFileTree] =
    useState<boolean>(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(
    undefined,
  );
  const [selectedUnmodifiedFilePath, setSelectedUnmodifiedFilePath] = useState<
    string | undefined
  >(undefined);
  const [unmodifiedFileContent, setUnmodifiedFileContent] =
    useState<string>('');
  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [comparisonFileContent, setComparisonFileContent] = useState<
    string | undefined
  >('');
  const [preventComparisonAutoLoad, setPreventComparisonAutoLoad] =
    useState<boolean>(false);
  const [historyOptions, setHistoryOptions] = useState<ListOption[]>([]);
  const [editButtonPressed, setEditButtonPressed] = useState<boolean>(false);

  useEffect(() => {
    setOriginalFileContent('');
    setComparisonFileContent('');
    setForceHideComparisonFileTree(false);
    setShowCodeViewer(false);
    setPreventComparisonAutoLoad(false);
    setHistoryOptions([]);
    setEditButtonPressed(false);
  }, [workItemId]);

  useEffect(() => {
    if (codeGenState.result?.iterations) {
      const options = buildIterationsHistory(
        codeGenState.result.iterations,
        13,
      );
      setHistoryOptions(options);
    }
  }, [codeGenState.result]);

  useEffect(() => {
    if (!selectedIteration || !projectPath || preventComparisonAutoLoad) return;

    const iterationFiles = selectedIteration.files;
    const fileKeys = Object.keys(iterationFiles);
    if (fileKeys.length > 0) {
      const fileKey = fileKeys[0];
      setComparisonFileContent(iterationFiles[fileKey].content);
      const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
      window.fileAPI
        .readFileContent(absolutePath)
        .then((orig) => {
          setOriginalFileContent(orig);
          setShowCodeViewer(true);
        })
        .catch(() => {});
    }
  }, [selectedIteration, projectPath, preventComparisonAutoLoad]);

  const codeGenExists =
    (codeGenState.result &&
      Object.keys(codeGenState.result.iterations).length > 0) ||
    false;

  const loadFirstComparisonFile = useCallback(() => {
    if (
      !projectPath ||
      !codeGenState.latestFiles ||
      !selectedIteration ||
      preventComparisonAutoLoad
    ) {
      return;
    }
    const fileKeys = Object.keys(selectedIteration.files);
    if (fileKeys.length > 0) {
      const fileKey = fileKeys[0];
      const generatedContent =
        codeGenState.latestFiles?.[fileKey]?.content || '';
      setSelectedFilePath(fileKey);
      setComparisonFileContent(generatedContent);
      const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
      window.fileAPI
        .readFileContent(absolutePath)
        .then((orig) => {
          setOriginalFileContent(orig);
          setShowCodeViewer(true);
        })
        .catch(() => {});
    } else {
      setShowCodeViewer(true);
    }
  }, [projectPath, codeGenState, selectedIteration, preventComparisonAutoLoad]);

  useEffect(() => {
    const ids = selectedIteration?.personalities?.map((p) => p.id) ?? [];
    personalityRefs.forEach((r) => r.current?.setSelected(ids));
  }, [
    selectedIteration?.id,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
  ]);

  useEffect(() => {
    if (
      !preventComparisonAutoLoad &&
      codeGenState.latestFiles &&
      !showCodeViewer
    ) {
      loadFirstComparisonFile();
    }
  }, [
    preventComparisonAutoLoad,
    codeGenState.latestFiles,
    showCodeViewer,
    loadFirstComparisonFile,
  ]);

  const handleClosePreview = useCallback(() => {
    setShowCodeViewer(false);
    setOriginalFileContent('');
    setComparisonFileContent(undefined);
  }, []);

  const handleApplyChanges = useCallback(async () => {
    if (!projectPath) {
      notification.error({ message: 'Project path not set!' });
      return;
    }
    try {
      const selectedPaths = Object.keys(applySelectedFiles);
      if (!selectedPaths.length) {
        notification.info({ message: 'No files selected to apply changes.' });
        return;
      }
      await Promise.all(
        selectedPaths.map(async (originalPath) => {
          const relativePath = getRelativePath(originalPath, projectPath);
          const normalizedRelativePath = path.normalize(relativePath);
          let generatedContent:
            | { content: string; deleted?: boolean }
            | undefined;
          if (selectedIteration && selectedIteration.files) {
            const fileKeyMatch = Object.keys(selectedIteration.files).find(
              (key) => path.normalize(key) === normalizedRelativePath,
            );
            if (fileKeyMatch) {
              generatedContent = selectedIteration.files[fileKeyMatch];
            }
          }
          if (!generatedContent && codeGenState.latestFiles) {
            const fileKeyMatch = Object.keys(codeGenState.latestFiles).find(
              (key) => path.normalize(key) === normalizedRelativePath,
            );
            if (fileKeyMatch) {
              generatedContent = codeGenState.latestFiles[fileKeyMatch];
            }
          }
          const fallbackContent = applySelectedFiles[originalPath] ?? '';
          const contentToWrite = generatedContent?.content ?? fallbackContent;
          const absolutePath = getAbsoluteFilePath(relativePath, projectPath);
          if (generatedContent && generatedContent.deleted) {
            await window.fileAPI.deleteFile(absolutePath);
          } else {
            await window.fileAPI.writeFileContent(absolutePath, contentToWrite);
          }
        }),
      );
      notification.success({ message: 'Selected files updated successfully.' });
    } catch {
      notification.error({ message: 'Failed to apply changes.' });
    }
  }, [
    projectPath,
    applySelectedFiles,
    codeGenState.latestFiles,
    selectedIteration,
  ]);

  const handleHistoryOptionClick = useCallback(
    async (option: ListOption) => {
      if (!previewTaskDescriptionPreviewMode) {
        setPreviewTaskDescriptionPreviewMode(true);
      }
      setEditButtonPressed(false);
      if (!projectPath) return;

      const iterationFromOption = getIterationById(codeGenState, option.value);
      if (!iterationFromOption) return;

      setForceHideComparisonFileTree(false);
      setPreventComparisonAutoLoad(false);
      dispatch(updateSelectedIteration(option.value));

      const personalityIds =
        iterationFromOption.personalities?.map((p) => p.id) || [];
      personalityRefs.forEach((r) => r.current?.setSelected(personalityIds));

      const fileKeys = Object.keys(iterationFromOption.files);
      if (fileKeys.length > 0) {
        const fileKey = fileKeys[0];
        setComparisonFileContent(iterationFromOption.files[fileKey]?.content);
        const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
        try {
          const originalContent =
            await window.fileAPI.readFileContent(absolutePath);
          setOriginalFileContent(originalContent);
          setShowCodeViewer(true);
        } catch (err: any) {
          console.error('Error reading original file for iteration:', err);
        }
      }

      const promptText = iterationFromOption.prompt || '';
      const additionalInfo = extractIterationLabel(promptText, 98);
      if (previewTaskDescRef.current) {
        previewTaskDescRef.current.setContent(additionalInfo);
      }
    },
    [
      dispatch,
      codeGenState,
      projectPath,
      previewTaskDescRef,
      previewTaskDescriptionPreviewMode,
      setPreviewTaskDescriptionPreviewMode,
      personalityRefs,
    ],
  );

  const handleEditIterationFirstIteration = async () => {
    try {
      setEditButtonPressed(true);
      setPreventComparisonAutoLoad(true);
      setForceHideComparisonFileTree(true);
      const { iterations } = codeGenState.result!;
      const firstIteration = iterations[0];
      const firstIterationId = firstIteration.id;
      dispatch(updateSelectedIteration(firstIterationId));
      const personalityIds =
        firstIteration.personalities?.map((p) => p.id) || [];
      personalityRefs.forEach((r) => r.current?.setSelected(personalityIds));
      setShowCodeViewer(false);
      setComparisonFileContent(undefined);
      setOriginalFileContent('');
      if (projectPath) {
        await window.fileAPI.getFileTree(projectPath);
      }
      if (bigTaskDescRef.current && workItem) {
        bigTaskDescRef.current.setContent(workItem.description);
      }
      setBigTaskDescription(workItem?.description || '');
    } catch {
      notification.error({
        message: 'Edit initiation failed',
      });
    }
  };

  const handleEditRestIteration = async () => {
    try {
      setEditButtonPressed(true);
      if (previewTaskDescriptionPreviewMode) {
        setPreviewTaskDescriptionPreviewMode(false);
      }
      if (selectedIteration) {
        const personalityIds =
          selectedIteration.personalities?.map((p) => p.id) || [];
        personalityRefs.forEach((r) => r.current?.setSelected(personalityIds));

        if (previewTaskDescRef.current) {
          previewTaskDescRef.current.setContent(selectedIteration.prompt);
          setPreviewTaskDescription(selectedIteration.prompt);
        }
      }
    } catch {
      notification.error({
        message: 'Edit initiation failed',
      });
    }
  };

  const handleEditIteration = useCallback(async () => {
    if (!orgSlug || !projectId || !workItemId) return;
    if (!codeGenState.result) return;
    const { iterations } = codeGenState.result;
    const firstIterationId = iterations[0].id;
    if (selectedIterationId && selectedIterationId === firstIterationId) {
      await handleEditIterationFirstIteration();
    } else {
      await handleEditRestIteration();
    }
  }, [
    orgSlug,
    projectId,
    workItemId,
    codeGenState,
    selectedIterationId,
    selectedIteration,
    projectPath,
    bigTaskDescRef,
    workItem,
    personalityDropdownHeaderRef,
  ]);

  const handleSendCreateGenerationSession = async (
    selectedProvider: string,
    personalityIds: string[],
  ) => {
    updateContextDebounced.cancel();
    setHasUserModifiedContext(false);
    if (preventComparisonAutoLoad) {
      setPreventComparisonAutoLoad(false);
    }
    if (workItem && workItem.codeGenerationId) {
      dispatch(clearLocalCodeGenerationId(workItemId!));
    }
    await dispatch(
      executeAICoder({
        orgSlug: orgSlug!,
        projectId: projectId!,
        workItemId: workItemId!,
        provider: selectedProvider,
        personalityIds,
      }),
    );
  };

  const handleSendAddIteration = async (
    selectedProvider: string,
    prompt: string,
    personalityIds: string[],
  ) => {
    if (!previewTaskDescriptionPreviewMode) {
      setPreviewTaskDescriptionPreviewMode(true);
    }
    const iterations = codeGenState.result?.iterations || [];
    const currentIndex = iterations.findIndex(
      (iter) => iter.id === selectedIterationId,
    );
    const startFromIterationId =
      editButtonPressed && currentIndex > 0
        ? iterations[currentIndex - 1].id
        : selectedIterationId!;
    smallTaskDescRef.current?.setContent('');
    setSmallTaskDescription('');
    await dispatch(
      executeAICoder({
        orgSlug: orgSlug!,
        projectId: projectId!,
        workItemId: workItemId!,
        artifactId: workItem!.codeGenerationId!,
        artifactIterationId: startFromIterationId,
        prompt,
        provider: selectedProvider,
        personalityIds,
      }),
    );
    setShowCodeViewer(true);
    setEditButtonPressed(false);
  };

  const renderLoadingHistoryItem = () => {
    const iterations = codeGenState.result?.iterations || [];
    const latestIterationId =
      iterations.length > 0 ? iterations[iterations.length - 1].id : null;
    if (selectedIterationId === latestIterationId) {
      const id = `loading-${Date.now()}`;
      const loadingOption: ListOption = {
        value: id,
        label: <Spin spinning size="small" />,
        key: id,
      };
      if (editButtonPressed) {
        setHistoryOptions((prevOptions) =>
          prevOptions.map((option) =>
            option.value === selectedIterationId
              ? {
                  ...option,
                  label: <Spin spinning size="small" />,
                  isLoading: true,
                }
              : option,
          ),
        );
        return;
      }
      setHistoryOptions((prevOptions) => [...prevOptions, loadingOption]);
    } else if (editButtonPressed) {
      setHistoryOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.value === selectedIterationId
            ? {
                ...option,
                label: <Spin spinning size="small" />,
                isLoading: true,
              }
            : option,
        ),
      );
    }
  };

  const handleSend = useCallback(async () => {
    if (!orgSlug || !projectId || !workItemId) return;
    renderLoadingHistoryItem();
    setHasUserModifiedContext(true);
    setIsLoading?.(true);
    try {
      const selectedProvider =
        (dropdownProviderRef.current?.getSelected() as string) || '';

      const prompt = editButtonPressed
        ? previewTaskDescRef.current?.getContent() || ''
        : smallTaskDescRef.current?.getContent() ||
          bigTaskDescRef.current?.getContent() ||
          '';
      const isFirstIteration =
        codeGenState.result &&
        selectedIteration &&
        codeGenState.result.iterations[0].id === selectedIterationId;

      let selectedDropdownRef: typeof personalityDropdownFooterRef;

      if (editButtonPressed && isFirstIteration) {
        selectedDropdownRef = personalityDropdownContentRef;
      } else if (editButtonPressed) {
        selectedDropdownRef = personalityDropdownHeaderRef;
      } else {
        selectedDropdownRef = personalityDropdownFooterRef;
      }

      const personalityIds =
        (selectedDropdownRef.current?.getSelected() as string[]) ?? [];

      if (
        (editButtonPressed && isFirstIteration) ||
        (workItem && !workItem.codeGenerationId)
      ) {
        await handleSendCreateGenerationSession(
          selectedProvider,
          personalityIds,
        );
      } else {
        await handleSendAddIteration(selectedProvider, prompt, personalityIds);
      }
    } catch {
      notification.error({
        message: 'Code Generation Error',
      });
    } finally {
      setBigTaskDescription('');
      updateContextDebounced.cancel();
      setHasUserModifiedContext(false);
      setIsLoading?.(false);
      setShowCodeViewer(true);
      setForceHideComparisonFileTree(false);
      setPreviewTaskDescriptionPreviewMode(true);
      setEditButtonPressed(false);
    }
  }, [
    orgSlug,
    projectId,
    workItemId,
    setHasUserModifiedContext,
    setIsLoading,
    dropdownProviderRef,
    smallTaskDescRef,
    bigTaskDescRef,
    codeGenState,
    selectedIterationId,
    workItem,
    projectPath,
    dispatch,
    editButtonPressed,
    previewTaskDescRef,
  ]);

  return {
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
    historyOptions,
    handleHistoryOptionClick,
    handleEditIteration,
    handleSend,
    handleApplyChanges,
    handleClosePreview,
  };
}
