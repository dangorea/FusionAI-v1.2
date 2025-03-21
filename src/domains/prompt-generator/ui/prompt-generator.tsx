import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, notification } from 'antd';
import debounce from 'lodash/debounce';
import { useParams } from 'react-router';
import pathBrowser from 'path-browserify';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectAllRules } from '../../../lib/redux/feature/rules/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import {
  updateCodeSession,
  updateWorkItemThunk,
} from '../../../lib/redux/feature/work-items/thunk';
import {
  clearCodeGeneration,
  updateSelectedIteration,
} from '../../../lib/redux/feature/code-generation/reducer';
import {
  addIterationThunk,
  fetchCodeGeneration,
} from '../../../lib/redux/feature/code-generation/thunk';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import type {
  DropdownRef,
  FileNode,
  FileSet,
  ListOption,
} from '../../../components';
import type { TextBlockType, WorkItemType } from '../../work-item/model/types';
import styles from './prompt-generator.module.scss';
import type { TaskDescriptionInputRef } from '../components';
import {
  ContentArea,
  HistoryPanel,
  Loading,
  Sidebar,
  TaskDescriptionFooter,
  TaskDescriptionHeader,
} from '../components';
import {
  buildIterationsHistory,
  extractIterationLabel,
} from '../../../utils/iteration';
import { clearLocalCodeGenerationId } from '../../../lib/redux/feature/work-items/reducer';

export function removeAllFileBlocks(text: string): string {
  const pattern = /\n\n=== File: .*? ===\n[\s\S]*?\n=== EndFile: .*? ===\n\n/g;
  return text.replace(pattern, '');
}

export function getAbsoluteFilePath(
  filePath: string,
  projectPath: string,
): string {
  if (pathBrowser.isAbsolute(filePath)) {
    return pathBrowser.normalize(filePath);
  }
  let relativeKey = filePath;
  const projFolderName = projectPath.split(/[\\/]/).pop() || '';
  if (relativeKey.startsWith(projFolderName)) {
    relativeKey = relativeKey
      .slice(projFolderName.length)
      .replace(/^[/\\]+/, '');
  }
  return pathBrowser.normalize(pathBrowser.join(projectPath, relativeKey));
}

export function getRelativePath(filePath: string, projectPath: string): string {
  return projectPath && filePath.startsWith(projectPath)
    ? filePath.slice(projectPath.length).replace(/^[/\\]+/, '')
    : filePath;
}

export async function buildGeneratedFileSet(
  iterationFiles: Record<string, string>,
  projectPath: string,
): Promise<FileSet> {
  const genTree = await window.fileAPI.buildGeneratedFileTree(
    iterationFiles,
    projectPath,
  );
  return {
    id: 'generated',
    name: 'Suggested Changes',
    tree: genTree,
    visible: true,
  };
}

export function getIterationFileContent(
  filePath: string,
  iterationFiles: Record<string, string>,
  projectPath: string,
): string | undefined {
  let searchPath = filePath;
  if (projectPath && filePath.startsWith(projectPath)) {
    const relativePath = getRelativePath(filePath, projectPath);
    searchPath = pathBrowser.normalize(relativePath);
  }
  return (
    iterationFiles[searchPath] ||
    iterationFiles[pathBrowser.basename(searchPath)]
  );
}

export function updateTaskDescriptionWithFileBlocks(
  ref: TaskDescriptionInputRef,
  selectedFiles: Record<string, string>,
): string {
  const currentText = ref.getContent();
  const cleaned = removeAllFileBlocks(currentText);
  ref.setContent(cleaned);
  Object.entries(selectedFiles).forEach(([fp, content]) => {
    ref.addExtraContent(
      `\n\n=== File: ${fp} ===\n${content}\n=== EndFile: ${fp} ===\n\n`,
    );
  });
  return cleaned;
}

export function getCheckedPaths(
  sourceFiles: { path: string }[],
  projectPath: string,
): React.Key[] {
  return sourceFiles.map((sf) => getAbsoluteFilePath(sf.path, projectPath));
}

export function PromptGenerator() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const projectId = useAppSelector(selectSelectedProjectId);
  const rules = useAppSelector(selectAllRules);
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const codeGenState = useAppSelector((state) => state.codeGeneration);
  const orgSlug = org?.slug;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projectPath, setProjectPath] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {},
  );
  const [hasUserModified, setHasUserModified] = useState<boolean>(false);
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [comparisonFileContent, setComparisonFileContent] = useState<string>();
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [baseFileSet, setBaseFileSet] = useState<FileSet | null>(null);
  const [generatedFileSet, setGeneratedFileSet] = useState<FileSet | null>(
    null,
  );
  const [historyOptions, setHistoryOptions] = useState<ListOption[]>([]);
  const [isFileBlockFeatureEnabled, setIsFileBlockFeatureEnabled] =
    useState<boolean>(
      localStorage.getItem('fileBlockFeatureEnabled') === 'true',
    );
  const [defaultCheckedKeys, setDefaultCheckedKeys] = useState<React.Key[]>([]);
  const [fileTreeTouched, setFileTreeTouched] = useState<boolean>(false);
  const [preventComparisonAutoLoad, setPreventComparisonAutoLoad] =
    useState<boolean>(false);
  const [bigTaskDescription, setBigTaskDescription] = useState<string>('');
  const [smallTaskDescription, setSmalTaskDescription] = useState<string>('');

  const bigTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const smallTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const previewTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const featureEnabledRef = useRef(isFileBlockFeatureEnabled);
  const dropdownRef = useRef<DropdownRef | null>(null);

  useEffect(() => {
    dispatch(clearCodeGeneration());
    const action = async () => {
      if (workItem?.codeGenerationId) {
        setIsLoading(true);
        await dispatch(fetchCodeGeneration(workItem.codeGenerationId));
        setIsLoading(false);
      }
    };

    action();
  }, [workItem?.codeGenerationId, dispatch]);

  useEffect(() => {
    if (
      workItem?.description &&
      bigTaskDescRef.current &&
      bigTaskDescription.trim() === ''
    ) {
      bigTaskDescRef.current.setContent(workItem.description);
      setBigTaskDescription(workItem.description);
    }
  }, [workItem]);

  useEffect(() => {
    if (!projectId) return;
    const savedPath = localStorage.getItem(
      `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
    );
    if (savedPath) {
      setProjectPath(savedPath);
    }
  }, [projectId]);

  useEffect(() => {
    async function loadSourceFiles() {
      if (
        workItem?.sourceFiles &&
        projectPath &&
        Object.keys(selectedFiles).length === 0
      ) {
        const filePaths = workItem.sourceFiles.map((sf) =>
          getAbsoluteFilePath(sf.path, projectPath),
        );
        const filesContent = await Promise.all(
          filePaths.map(async (fp) => {
            const content = await window.fileAPI.readFileContent(fp);
            return { fp, content };
          }),
        );
        const newSelectedFiles: Record<string, string> = {};
        filesContent.forEach(({ fp, content }) => {
          newSelectedFiles[fp] = content;
        });
        setSelectedFiles(newSelectedFiles);
      }
    }

    loadSourceFiles();
  }, [workItem, projectPath]);

  const removeAllFileBlocksCallback = useCallback(removeAllFileBlocks, []);

  const handleMultipleSelect = useCallback(async (filePaths: string[]) => {
    setFileTreeTouched(true);
    setHasUserModified(true);
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
  }, []);

  const handleSingleSelect = useCallback(
    async (filePath: string) => {
      if (!filePath) {
        setOriginalFileContent('');
        setComparisonFileContent(undefined);
        setShowCodeViewer(false);
        return;
      }

      setHasUserModified(true);

      const originalContent = await window.fileAPI.readFileContent(filePath);
      setOriginalFileContent(originalContent);

      let iterationFiles: Record<string, string> | null = null;
      if (codeGenState.result && codeGenState.selectedIterationId) {
        const selectedIteration = codeGenState.result.iterations.find(
          (iteration) => iteration._id === codeGenState.selectedIterationId,
        );
        if (selectedIteration) {
          iterationFiles = selectedIteration.files;
        }
      }

      if (iterationFiles) {
        const generatedContent = getIterationFileContent(
          filePath,
          iterationFiles,
          projectPath,
        );
        setComparisonFileContent(generatedContent || undefined);
      } else {
        setComparisonFileContent(undefined);
      }

      setShowCodeViewer(true);
    },
    [codeGenState.result, codeGenState.selectedIterationId, projectPath],
  );

  useEffect(() => {
    if (!isFileBlockFeatureEnabled) return;
    if (!bigTaskDescRef.current) return;

    const cleaned = updateTaskDescriptionWithFileBlocks(
      bigTaskDescRef.current,
      selectedFiles,
    );
    setBigTaskDescription(cleaned);
  }, [selectedFiles, removeAllFileBlocksCallback, isFileBlockFeatureEnabled]);

  useEffect(() => {
    if (workItem?.sourceFiles && projectPath) {
      const checkedPaths = getCheckedPaths(workItem.sourceFiles, projectPath);
      setDefaultCheckedKeys(checkedPaths);
    }
  }, [workItem?.sourceFiles, projectPath]);

  useEffect(() => {
    if (
      codeGenState.result &&
      codeGenState.result.iterations &&
      codeGenState.result.iterations.length > 0 &&
      previewTaskDescRef.current
    ) {
      const { iterations } = codeGenState.result;
      const selectedIteration = iterations.find(
        (iteration) => iteration._id === codeGenState.selectedIterationId,
      );
      if (selectedIteration) {
        const promptText = selectedIteration.prompt || '';
        const additionalInfo = extractIterationLabel(promptText, 98);
        previewTaskDescRef.current.setContent(additionalInfo);
      }
    }
  }, [codeGenState.result, codeGenState.selectedIterationId]);

  useEffect(() => {
    if (codeGenState.result && codeGenState.result.iterations) {
      const options = buildIterationsHistory(
        codeGenState.result.iterations,
        17,
      );
      setHistoryOptions(options);
    }
  }, [codeGenState.result]);

  useEffect(() => {
    if (
      projectPath &&
      codeGenState.result &&
      codeGenState.result.iterations &&
      codeGenState.selectedIterationId
    ) {
      const selectedIteration = codeGenState.result.iterations.find(
        (iteration) => iteration._id === codeGenState.selectedIterationId,
      );
      if (selectedIteration) {
        const iterationFiles = selectedIteration.files;
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
          .catch((err) =>
            console.error(
              'Error building generated file tree for selected iteration:',
              err,
            ),
          );
        const fileKeys = Object.keys(iterationFiles);
        if (fileKeys.length > 0) {
          const fileKey = fileKeys[0];
          setComparisonFileContent(iterationFiles[fileKey]);
          const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
          window.fileAPI
            .readFileContent(absolutePath)
            .then((originalContent: string) => {
              setOriginalFileContent(originalContent);
            })
            .catch((err: any) =>
              console.error(
                'Error reading original file for selected iteration:',
                err,
              ),
            );
        }
      }
    }
  }, [projectPath, codeGenState.selectedIterationId, codeGenState.result]);

  const updateWorkItemDebounced = useCallback(
    debounce(async () => {
      if (!orgSlug || !projectId) return;

      const currentDescription =
        bigTaskDescRef.current?.getContent() ||
        smallTaskDescRef.current?.getContent() ||
        '';

      const descriptionChanged = currentDescription !== workItem?.description;
      const fileTreeChanged = fileTreeTouched;
      const textBlocksChanged = selectedRules.length > 0;

      if (!descriptionChanged && !fileTreeChanged && !textBlocksChanged) {
        return;
      }
      const computedSourceFiles = fileTreeChanged
        ? Object.entries(selectedFiles).map(([absPath, content]) => {
            const relative = getRelativePath(absPath, projectPath);
            return { path: relative, content };
          })
        : workItem?.sourceFiles || [];

      const computedTextBlocks = textBlocksChanged
        ? (selectedRules
            .map((ruleId) => {
              const r = rules.find((x) => x.id === ruleId);
              return r ? { id: r.id, title: r.title, details: r.title } : null;
            })
            .filter(Boolean) as TextBlockType[])
        : workItem?.textBlocks || [];

      const updatePayload: Partial<WorkItemType> = { id };
      if (descriptionChanged) {
        updatePayload.description = currentDescription;
      }
      updatePayload.sourceFiles = computedSourceFiles;
      updatePayload.textBlocks = computedTextBlocks;

      try {
        await dispatch(
          updateWorkItemThunk({
            orgSlug,
            projectId,
            workItem: updatePayload,
          }),
        );
        setHasUserModified(false);
      } catch (err: any) {
        console.error('Failed to update work item:', err);
        notification.error({
          message: 'Work item update failed',
          description:
            err.message || 'An error occurred while updating the work item.',
        });
      }
    }, 900),
    [
      selectedFiles,
      selectedRules,
      rules,
      orgSlug,
      projectId,
      id,
      projectPath,
      workItem,
      codeGenState.result,
      fileTreeTouched,
    ],
  );

  useEffect(() => {
    if (hasUserModified && !showCodeViewer) {
      updateWorkItemDebounced();
    } else {
      updateWorkItemDebounced.cancel();
    }
    return () => updateWorkItemDebounced.cancel();
  }, [hasUserModified, updateWorkItemDebounced, showCodeViewer]);

  const handleSend = useCallback(async () => {
    const selectedProvider =
      (dropdownRef.current?.getSelected() as string) || '';

    setHasUserModified(true);
    if (!orgSlug || !projectId || !id) return;
    setIsLoading(true);
    try {
      if (codeGenState.result && !preventComparisonAutoLoad) {
        const prompt =
          smallTaskDescRef.current?.getContent() ||
          bigTaskDescRef.current?.getContent() ||
          '';

        if (codeGenState.selectedIterationId && workItem?.codeGenerationId) {
          smallTaskDescRef.current?.setContent('');
          setSmalTaskDescription('');

          await dispatch(
            addIterationThunk({
              id: workItem.codeGenerationId,
              prompt,
              startFromIterationId: codeGenState.selectedIterationId,
              provider: selectedProvider,
            }),
          );
          await dispatch(fetchCodeGeneration(workItem.codeGenerationId));
          setShowCodeViewer(true);
        }
      } else {
        updateWorkItemDebounced.cancel();
        setHasUserModified(false);

        if (workItem && workItem.codeGenerationId) {
          dispatch(clearLocalCodeGenerationId(id));
        }

        const updateAction = await dispatch(
          updateCodeSession({
            orgSlug,
            projectId,
            id,
            provider: selectedProvider,
          }),
        );
        const updatedWorkItem = updateAction.payload as WorkItemType;

        if (
          updatedWorkItem &&
          updatedWorkItem.codeGenerationId &&
          updatedWorkItem.sourceFiles?.length
        ) {
          const firstFilePath = updatedWorkItem.sourceFiles[0].path;
          const normalizedFilePath = getAbsoluteFilePath(
            firstFilePath,
            projectPath,
          );
          const original =
            await window.fileAPI.readFileContent(normalizedFilePath);
          setOriginalFileContent(original);
          setPreventComparisonAutoLoad(false);
          setShowCodeViewer(true);
        }
      }
    } catch (err: any) {
      console.error('Error generating code:', err);
      notification.error({
        message: 'Code Generation Error',
        description: err.message || 'Failed to generate code',
      });
    } finally {
      setIsLoading(false);
      setBigTaskDescription('');
      updateWorkItemDebounced.cancel();
      setHasUserModified(false);
    }
  }, [
    orgSlug,
    projectId,
    id,
    dispatch,
    workItem,
    projectPath,
    codeGenState.result,
    codeGenState.selectedIterationId,
    preventComparisonAutoLoad,
    updateWorkItemDebounced,
  ]);

  const handleApplyChanges = useCallback(async () => {
    if (!projectPath) {
      notification.error({ message: 'Project path not set!' });
      return;
    }

    try {
      const selectedPaths = Object.keys(selectedFiles);

      if (!selectedPaths.length) {
        notification.info({ message: 'No files selected to apply changes.' });
        return;
      }

      await Promise.all(
        selectedPaths.map(async (originalPath) => {
          const relativePath = getRelativePath(originalPath, projectPath);
          const generatedContent = codeGenState.latestFiles?.[relativePath];
          const fallbackContent = selectedFiles[originalPath] ?? '';
          const contentToWrite = generatedContent ?? fallbackContent;
          const absolutePath = pathBrowser.join(projectPath, relativePath);

          await window.fileAPI.writeFileContent(absolutePath, contentToWrite);
        }),
      );

      notification.success({ message: 'Selected files updated successfully.' });
    } catch (err: any) {
      console.error('Error applying changes:', err);
      notification.error({ message: 'Failed to apply changes.' });
    }
  }, [projectPath, selectedFiles, codeGenState.latestFiles]);

  const loadFirstComparisonFile = useCallback(() => {
    if (!projectPath || !codeGenState.latestFiles || preventComparisonAutoLoad)
      return;
    const fileKeys = Object.keys(codeGenState.latestFiles);
    if (fileKeys.length > 0) {
      const fileKey = fileKeys[0];
      const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
      window.fileAPI
        .readFileContent(absolutePath)
        .then((originalContent: string) => {
          setOriginalFileContent(originalContent);
          const generatedContent = codeGenState.latestFiles?.[fileKey] || '';
          setComparisonFileContent(generatedContent);
        })
        .catch((err: any) =>
          console.error('Error auto-loading comparison file:', err),
        );
      window.fileAPI
        .buildGeneratedFileTree(codeGenState.latestFiles, projectPath)
        .then((genTree: FileNode) => {
          setGeneratedFileSet({
            id: 'generated',
            name: 'Suggested Changes',
            tree: genTree,
            visible: true,
          });
          setShowCodeViewer(true);
        })
        .catch((err) =>
          console.error('Error building generated file tree', err),
        );
    }
  }, [projectPath, codeGenState.latestFiles]);

  const handleHistoryOptionClick = async (option: ListOption) => {
    if (!orgSlug || !projectId || !id) return;

    setPreventComparisonAutoLoad(false);
    dispatch(updateSelectedIteration(option.value));

    if (projectPath && codeGenState.result && codeGenState.result.iterations) {
      const selectedIteration = codeGenState.result.iterations.find(
        (iteration) => iteration._id === option.value,
      );
      if (selectedIteration) {
        const iterationFiles = selectedIteration.files;
        try {
          const genFileSet = await buildGeneratedFileSet(
            iterationFiles,
            projectPath,
          );
          setGeneratedFileSet(genFileSet);
        } catch (err) {
          console.error(
            'Error building generated file tree for selected iteration:',
            err,
          );
        }

        const fileKeys = Object.keys(iterationFiles);
        if (fileKeys.length > 0) {
          const fileKey = fileKeys[0];
          setComparisonFileContent(iterationFiles[fileKey]);
          const absolutePath = getAbsoluteFilePath(fileKey, projectPath);
          try {
            const originalContent =
              await window.fileAPI.readFileContent(absolutePath);
            setOriginalFileContent(originalContent);
            setShowCodeViewer(true);
          } catch (err) {
            console.error(
              'Error reading original file for selected iteration:',
              err,
            );
          }
        }

        const promptText = selectedIteration.prompt || '';
        const additionalInfo = extractIterationLabel(promptText, 98);
        if (previewTaskDescRef.current) {
          previewTaskDescRef.current.setContent(additionalInfo);
        }
      }
    }
  };

  const handleClosePreview = useCallback(() => {
    setShowCodeViewer(false);
    setOriginalFileContent('');
    setComparisonFileContent(undefined);
  }, []);

  useEffect(() => {
    featureEnabledRef.current = isFileBlockFeatureEnabled;
  }, [isFileBlockFeatureEnabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'x') {
        if (!featureEnabledRef.current) {
          setIsFileBlockFeatureEnabled(true);
          notification.info({
            message: 'Feature Enabled Temporarily',
            description:
              'The file block modification feature is now enabled temporarily.',
          });
        }
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
        if (!featureEnabledRef.current) {
          setIsFileBlockFeatureEnabled(true);
          localStorage.setItem('fileBlockFeatureEnabled', 'true');
          notification.info({
            message: 'Feature Permanently Enabled',
            description:
              'The file block modification feature is now permanently enabled.',
          });
        } else {
          setIsFileBlockFeatureEnabled(false);
          localStorage.removeItem('fileBlockFeatureEnabled');
          notification.info({
            message: 'Feature Disabled',
            description: 'The file block modification feature is now disabled.',
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsub = window.electron.ipcRenderer.on(
      'file-changed',
      (data: any) => {
        setHasUserModified(true);
        setSelectedFiles((prev) => ({
          ...prev,
          [data.filePath]: data.content,
        }));
        const rootFolder = projectPath.split(/[\\/]/).pop() || '';
        const shortPath = data.filePath.startsWith(projectPath)
          ? data.filePath.slice(projectPath.length)
          : data.filePath;
        if (!showCodeViewer) {
          notification.info({
            message: `${rootFolder} File Updated`,
            description: `File changed: ${shortPath}`,
          });
        }
      },
    );
    return () => unsub();
  }, [projectPath]);

  useEffect(() => {
    Object.keys(selectedFiles).forEach((fp) => {
      window.fileAPI.watchFile(fp);
    });
  }, [selectedFiles]);

  useEffect(() => {
    if (projectPath && codeGenState.latestFiles) {
      window.fileAPI
        .getFileTree(projectPath)
        .then((tree: FileNode) => {
          setBaseFileSet({
            id: 'base',
            name: projectPath.split(/[\\/]/).pop() || 'Project',
            tree,
            visible: true,
          });
        })
        .catch((err) => console.error('Error loading base file tree', err));

      window.fileAPI
        .buildGeneratedFileTree(codeGenState.latestFiles, projectPath)
        .then((genTree: FileNode) => {
          setGeneratedFileSet({
            id: 'generated',
            name: 'Suggested Changes',
            tree: genTree,
            visible: true,
          });
        })
        .catch((err) =>
          console.error('Error building generated file tree', err),
        );
    }
  }, [projectPath, codeGenState.latestFiles]);

  useEffect(() => {
    if (preventComparisonAutoLoad) return;
    if (projectPath && codeGenState.latestFiles && !showCodeViewer) {
      loadFirstComparisonFile();
    }
  }, [
    projectPath,
    codeGenState.latestFiles,
    showCodeViewer,
    preventComparisonAutoLoad,
    loadFirstComparisonFile,
  ]);

  async function handleEditFirstItem() {
    if (!orgSlug || !projectId || !id) return;
    try {
      setShowCodeViewer(false);
      setGeneratedFileSet(null);
      setComparisonFileContent(undefined);
      setOriginalFileContent('');
      setPreventComparisonAutoLoad(true);

      if (projectPath) {
        const tree = await window.fileAPI.getFileTree(projectPath);
        setBaseFileSet({
          id: 'base',
          name: projectPath.split(/[\\/]/).pop() || 'Project',
          tree,
          visible: true,
        });
      }

      if (workItem?.sourceFiles && projectPath) {
        const checkedPaths = getCheckedPaths(workItem.sourceFiles, projectPath);
        setDefaultCheckedKeys(checkedPaths);

        const filesContent = await Promise.all(
          checkedPaths.map(async (fp) => {
            const content = await window.fileAPI.readFileContent(fp as string);
            return { fp, content };
          }),
        );
        const selectedFilesMap: Record<string, string> = {};
        filesContent.forEach(({ fp, content }) => {
          selectedFilesMap[fp as string] = content;
        });
        setSelectedFiles(selectedFilesMap);
      }

      if (bigTaskDescRef.current && workItem) {
        bigTaskDescRef.current.setContent(workItem.description);
      }
      setBigTaskDescription(workItem?.description || '');
    } catch (error: any) {
      console.error('Failed to reset the code generation:', error);
      notification.error({
        message: 'Reset failed',
        description: error.message || 'Error resetting code generation.',
      });
    }
  }

  let fileTreeProps;
  if (showCodeViewer) {
    if (baseFileSet && generatedFileSet) {
      fileTreeProps = { fileSets: [baseFileSet, generatedFileSet] };
    } else if (baseFileSet) {
      fileTreeProps = { fileSets: [baseFileSet] };
    } else {
      fileTreeProps = {};
    }
  } else {
    fileTreeProps = { projectPath, initialCheckedKeys: defaultCheckedKeys };
  }

  const codeGenExists =
    (codeGenState.latestFiles &&
      Object.keys(codeGenState.latestFiles).length > 0) ||
    false;

  const disableSendBigTaskDescription =
    (bigTaskDescription.trim() || '') === '' ||
    (!showCodeViewer && Object.keys(selectedFiles).length === 0);

  const disableSmallTaskDescription = !!(
    (smallTaskDescRef.current && smallTaskDescription.trim() === '') ||
    ''
  );

  return (
    <Layout className={styles.promptGeneratorContainer}>
      <Layout className={styles['ide-layout']}>
        <TaskDescriptionHeader
          ref={previewTaskDescRef}
          codeGenExists={showCodeViewer && codeGenExists}
        />
        <Layout className={styles['ide-container']}>
          <Loading loading={isLoading}>
            <Sidebar
              fileTreeProps={fileTreeProps}
              codeGenExists={codeGenExists}
              handleMultipleSelect={handleMultipleSelect}
              handleSingleSelect={handleSingleSelect}
              handleApplyChanges={handleApplyChanges}
              rules={rules}
              setSelectedRules={setSelectedRules}
            />
            <ContentArea
              showCodeViewer={showCodeViewer}
              originalFileContent={originalFileContent}
              comparisonFileContent={comparisonFileContent}
              bigTaskDescRef={bigTaskDescRef}
              dropdownRef={dropdownRef}
              handleSend={handleSend}
              disableSend={disableSendBigTaskDescription}
              updateWorkItemDebounced={(value) => {
                setBigTaskDescription(value);
                setHasUserModified(true);
                updateWorkItemDebounced();
              }}
              onClosePreview={handleClosePreview}
            />
          </Loading>
        </Layout>
        <TaskDescriptionFooter
          ref={smallTaskDescRef}
          dropdownRef={dropdownRef}
          codeGenExists={showCodeViewer && codeGenExists}
          handleSend={handleSend}
          disableSend={disableSmallTaskDescription}
          updateWorkItemDebounced={(value) => {
            setSmalTaskDescription(value);
          }}
        />
      </Layout>
      <HistoryPanel
        historyOptions={historyOptions}
        handleHistoryOptionClick={handleHistoryOptionClick}
        selectedHistoryId={codeGenState.selectedIterationId}
        onEditFirstItem={handleEditFirstItem}
      />
    </Layout>
  );
}
