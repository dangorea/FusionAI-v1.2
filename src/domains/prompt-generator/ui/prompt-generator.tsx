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
import type { DropdownRef, FileNode, FileSet } from '../../../components';
import type { TextBlockType } from '../../work-item/model/types';
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
import type { IterationOption } from '../../../utils/iteration';
import {
  buildIterationsHistory,
  extractIterationLabel,
} from '../../../utils/iteration';

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
  const [historyOptions, setHistoryOptions] = useState<IterationOption[]>([]);
  const [isFileBlockFeatureEnabled, setIsFileBlockFeatureEnabled] =
    useState<boolean>(
      localStorage.getItem('fileBlockFeatureEnabled') === 'true',
    );

  const bigTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const smallTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const previewTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const featureEnabledRef = useRef(isFileBlockFeatureEnabled);
  const dropdownRef = useRef<DropdownRef | null>(null);

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
      // Magic shortcut: Ctrl+Shift+M toggles persistent state
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
    dispatch(clearCodeGeneration());
    if (workItem?.codeGenerationId) {
      dispatch(fetchCodeGeneration(workItem.codeGenerationId));
    }
  }, [workItem?.codeGenerationId, dispatch]);

  useEffect(() => {
    if (workItem && workItem.description && bigTaskDescRef.current) {
      bigTaskDescRef.current.setContent(workItem.description);
    }
  }, [workItem, bigTaskDescRef.current]);

  useEffect(() => {
    if (!projectId) return;
    const savedPath = localStorage.getItem(
      `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
    );
    if (savedPath) {
      setProjectPath(savedPath);
    }
  }, [projectId]);

  const removeAllFileBlocks = useCallback((text: string) => {
    const pattern =
      /\n\n=== File: .*? ===\n[\s\S]*?\n=== EndFile: .*? ===\n\n/g;
    return text.replace(pattern, '');
  }, []);

  const handleMultipleSelect = useCallback(async (filePaths: string[]) => {
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

      if (
        codeGenState.latestFiles &&
        Object.keys(codeGenState.latestFiles).length > 0
      ) {
        let searchPath = filePath;
        if (projectPath && filePath.startsWith(projectPath)) {
          const relativePath = filePath.slice(projectPath.length);
          const cleanRelativePath = relativePath.startsWith('/')
            ? relativePath.slice(1)
            : relativePath;
          searchPath = cleanRelativePath;
        }

        const generatedContent =
          codeGenState.latestFiles[searchPath] ||
          codeGenState.latestFiles[pathBrowser.normalize(searchPath)] ||
          codeGenState.latestFiles[pathBrowser.basename(searchPath)];

        setComparisonFileContent(generatedContent || undefined);
      } else {
        setComparisonFileContent(undefined);
      }
      setShowCodeViewer(true);
    },
    [codeGenState.latestFiles, projectPath],
  );

  useEffect(() => {
    if (!isFileBlockFeatureEnabled) return;
    if (!bigTaskDescRef.current) return;

    const currentText = bigTaskDescRef.current.getContent();
    const cleaned = removeAllFileBlocks(currentText);
    bigTaskDescRef.current.setContent(cleaned);
    Object.entries(selectedFiles).forEach(([fp, content]) => {
      bigTaskDescRef.current?.addExtraContent(
        `\n\n=== File: ${fp} ===\n${content}\n=== EndFile: ${fp} ===\n\n`,
      );
    });
  }, [selectedFiles, removeAllFileBlocks, isFileBlockFeatureEnabled]);

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
          let absolutePath = '';
          if (pathBrowser.isAbsolute(fileKey)) {
            absolutePath = pathBrowser.normalize(fileKey);
          } else {
            let relativeKey = fileKey;
            const projFolderName = projectPath.split(/[\\/]/).pop() || '';
            if (relativeKey.startsWith(projFolderName)) {
              relativeKey = relativeKey
                .slice(projFolderName.length)
                .replace(/^[/\\]+/, '');
            }
            absolutePath = pathBrowser.normalize(
              pathBrowser.join(projectPath, relativeKey),
            );
          }
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
      if (
        codeGenState.result &&
        codeGenState.result.iterations &&
        codeGenState.result.iterations.length > 0
      ) {
        return;
      }
      if (!hasUserModified || !orgSlug || !projectId) return;
      const sourceFiles = Object.entries(selectedFiles).map(
        ([absPath, content]) => {
          let relative = absPath;
          if (projectPath && absPath.startsWith(projectPath)) {
            const partial = absPath
              .slice(projectPath.length)
              .replace(/^[/\\]+/, '');
            relative = partial;
          }
          return { path: relative, content };
        },
      );
      const description =
        bigTaskDescRef.current?.getContent() ||
        smallTaskDescRef.current?.getContent() ||
        '';

      const textBlocks = selectedRules
        .map((ruleId) => {
          const r = rules.find((x) => x.id === ruleId);
          return r
            ? {
                id: r.id,
                title: r.title,
                details: r.title,
              }
            : null;
        })
        .filter(Boolean) as TextBlockType[];
      try {
        await dispatch(
          updateWorkItemThunk({
            orgSlug,
            projectId,
            workItem: { id, description, sourceFiles, textBlocks },
          }),
        );
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
      hasUserModified,
      orgSlug,
      projectId,
      id,
      projectPath,
    ],
  );

  useEffect(() => {
    if (
      hasUserModified &&
      !(
        codeGenState.result &&
        codeGenState.result.iterations &&
        codeGenState.result.iterations.length > 0
      )
    ) {
      updateWorkItemDebounced();
    }
    return () => updateWorkItemDebounced.cancel();
  }, [updateWorkItemDebounced, hasUserModified]);

  const handleSend = useCallback(async () => {
    setHasUserModified(true);
    if (!orgSlug || !projectId || !id) return;
    setIsLoading(true);
    try {
      if (codeGenState.result) {
        const prompt = smallTaskDescRef.current?.getContent() || '';

        if (codeGenState.selectedIterationId && workItem?.codeGenerationId) {
          smallTaskDescRef.current?.setContent('');

          await dispatch(
            addIterationThunk({
              id: workItem.codeGenerationId,
              prompt,
              startFromIterationId: codeGenState.selectedIterationId,
            }),
          );
          await dispatch(fetchCodeGeneration(workItem.codeGenerationId));
          setShowCodeViewer(true);
        }
      } else {
        await dispatch(updateCodeSession({ orgSlug, projectId, id }));
        if (
          workItem &&
          workItem.codeGenerationId &&
          workItem.sourceFiles?.length
        ) {
          const firstFilePath = workItem.sourceFiles[0].path;
          const normalizedFilePath = pathBrowser.isAbsolute(firstFilePath)
            ? pathBrowser.normalize(firstFilePath)
            : pathBrowser.normalize(
                pathBrowser.join(projectPath, firstFilePath),
              );
          const original =
            await window.fileAPI.readFileContent(normalizedFilePath);
          setOriginalFileContent(original);
          await dispatch(fetchCodeGeneration(workItem.codeGenerationId));
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
  ]);

  const handleApplyChanges = useCallback(async () => {
    if (!projectPath) {
      notification.error({ message: 'Project path not set!' });
      return;
    }
    try {
      const files = codeGenState.latestFiles || {};
      await Promise.all(
        Object.entries(files).map(async ([key, content]) => {
          const absolutePath = pathBrowser.join(projectPath, key);
          await window.fileAPI.writeFileContent(
            absolutePath,
            content as string,
          );
        }),
      );
      notification.success({ message: 'Files updated successfully.' });
    } catch (err: any) {
      console.error('Error applying changes:', err);
      notification.error({ message: 'Failed to apply changes.' });
    }
  }, [projectPath, codeGenState.latestFiles]);

  const handleHistoryOptionClick = async (option: IterationOption) => {
    if (codeGenState.selectedIterationId === option.value) {
      return;
    }
    dispatch(updateSelectedIteration(option.value));
  };

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
        notification.info({
          message: `${rootFolder} File Updated`,
          description: `File changed: ${shortPath}`,
        });
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
    if (projectPath && codeGenState.latestFiles && !showCodeViewer) {
      const fileKeys = Object.keys(codeGenState.latestFiles);
      if (fileKeys.length > 0) {
        const fileKey = fileKeys[0];
        const projFolderName = projectPath.split(/[\\/]/).pop() || '';
        let absolutePath = '';
        if (pathBrowser.isAbsolute(fileKey)) {
          absolutePath = pathBrowser.normalize(fileKey);
        } else {
          let relativeKey = fileKey;
          if (relativeKey.startsWith(projFolderName)) {
            relativeKey = relativeKey
              .slice(projFolderName.length)
              .replace(/^[/\\]+/, '');
          }
          absolutePath = pathBrowser.normalize(
            pathBrowser.join(projectPath, relativeKey),
          );
        }
        window.fileAPI
          .readFileContent(absolutePath)
          .then((originalContent: string) => {
            setOriginalFileContent(originalContent);
            const generatedContent = codeGenState.latestFiles?.[fileKey] || '';
            setComparisonFileContent(generatedContent);
            setShowCodeViewer(true);
          })
          .catch((err: any) =>
            console.error('Error auto-loading comparison file:', err),
          );
      }
    }
  }, [projectPath, codeGenState.latestFiles, showCodeViewer]);

  let fileTreeProps;
  if (
    codeGenState.latestFiles &&
    Object.keys(codeGenState.latestFiles).length > 0
  ) {
    if (baseFileSet && generatedFileSet) {
      fileTreeProps = { fileSets: [baseFileSet, generatedFileSet] };
    } else {
      fileTreeProps = {};
    }
  } else {
    fileTreeProps = { projectPath };
  }

  const codeGenExists =
    (codeGenState.latestFiles &&
      Object.keys(codeGenState.latestFiles).length > 0) ||
    false;

  return (
    <Layout className={styles.promptGeneratorContainer}>
      <Layout className={styles['ide-layout']}>
        <TaskDescriptionHeader
          ref={previewTaskDescRef}
          codeGenExists={codeGenExists}
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
              updateWorkItemDebounced={() => {
                setHasUserModified(true);
                updateWorkItemDebounced();
              }}
            />
          </Loading>
        </Layout>
        <TaskDescriptionFooter
          ref={smallTaskDescRef}
          dropdownRef={dropdownRef}
          codeGenExists={codeGenExists}
          handleSend={handleSend}
          updateWorkItemDebounced={() => {
            setHasUserModified(true);
            updateWorkItemDebounced();
          }}
        />
      </Layout>
      <HistoryPanel
        historyOptions={historyOptions}
        handleHistoryOptionClick={handleHistoryOptionClick}
        selectedHistoryId={codeGenState.selectedIterationId}
      />
    </Layout>
  );
}
