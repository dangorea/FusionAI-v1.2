import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Layout, notification } from 'antd';
import debounce from 'lodash/debounce';
import { useParams } from 'react-router';
import pathBrowser from 'path-browserify';
import { PlusSquareFilled } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectAllRules } from '../../../lib/redux/feature/rules/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import type { FileNode, FileSet } from '../../../components';
import { FileTree, ListBuilder } from '../../../components';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import type { TaskDescriptionInputRef } from '../components';
import { CodeViewer, TaskDescription } from '../components';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import type { TextBlockType } from '../../work-item/model/types';
import {
  updateCodeSession,
  updateWorkItemThunk,
} from '../../../lib/redux/feature/work-items/thunk';
import { clearCodeGeneration } from '../../../lib/redux/feature/code-generation/reducer';
import { fetchCodeGeneration } from '../../../lib/redux/feature/code-generation/thunk';

import styles from './prompt-generator.module.scss';

const { Sider, Content } = Layout;

export function PromptGenerator() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const projectId = useAppSelector(selectSelectedProjectId);
  const rules = useAppSelector(selectAllRules);
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const codeGenState = useAppSelector((state: any) => state.codeGeneration);

  const orgSlug = org?.slug;
  const [projectPath, setProjectPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {},
  );
  const [hasUserModified, setHasUserModified] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [comparisonFileContent, setComparisonFileContent] = useState<string>();
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [baseFileSet, setBaseFileSet] = useState<FileSet | null>(null);
  const [generatedFileSet, setGeneratedFileSet] = useState<FileSet | null>(
    null,
  );

  const taskDescRef = useRef<TaskDescriptionInputRef>(null);

  useEffect(() => {
    dispatch(clearCodeGeneration());
    if (workItem?.codeGenerationId) {
      dispatch(fetchCodeGeneration(workItem.codeGenerationId));
    }
  }, [workItem?.codeGenerationId, dispatch]);

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
          const projectFolder = pathBrowser.basename(projectPath);
          const relativePath = filePath.slice(projectPath.length);
          const cleanRelativePath = relativePath.startsWith('/')
            ? relativePath.slice(1)
            : relativePath;
          searchPath = `${projectFolder}/${cleanRelativePath}`;
        }

        const generatedContent =
          codeGenState.latestFiles[searchPath] ||
          codeGenState.latestFiles[pathBrowser.normalize(searchPath)] ||
          codeGenState.latestFiles[pathBrowser.basename(searchPath)];

        if (generatedContent) {
          setComparisonFileContent(generatedContent);
        } else {
          setComparisonFileContent(undefined);
        }
      } else {
        setComparisonFileContent(undefined);
      }

      setShowCodeViewer(true);
    },
    [codeGenState.latestFiles, projectPath],
  );

  useEffect(() => {
    if (!taskDescRef.current) return;
    const currentText = taskDescRef.current.getContent();
    const cleaned = removeAllFileBlocks(currentText);
    taskDescRef.current.setContent(cleaned);

    Object.entries(selectedFiles).forEach(([fp, content]) => {
      taskDescRef.current?.addExtraContent(
        `\n\n=== File: ${fp} ===\n${content}\n=== EndFile: ${fp} ===\n\n`,
      );
    });
  }, [selectedFiles, removeAllFileBlocks]);

  const updateWorkItemDebounced = useCallback(
    debounce(async () => {
      if (!hasUserModified || !orgSlug || !projectId) return;

      const sourceFiles = Object.entries(selectedFiles).map(
        ([absPath, content]) => {
          let relative = absPath;
          if (projectPath && absPath.startsWith(projectPath)) {
            const projName = projectPath.split(/[\\/]/).pop() || '';
            const partial = absPath
              .slice(projectPath.length)
              .replace(/^[/\\]+/, '');
            relative = `${projName}/${partial}`;
          }
          return { path: relative, content };
        },
      );

      const taskDescription = taskDescRef.current?.getContent() || '';
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
            workItem: {
              id,
              taskDescription,
              sourceFiles,
              textBlocks,
            },
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
    updateWorkItemDebounced();
    return () => updateWorkItemDebounced.cancel();
  }, [updateWorkItemDebounced]);

  const handleSend = useCallback(async () => {
    setHasUserModified(true);
    if (!orgSlug || !projectId || !id) return;

    try {
      await dispatch(updateCodeSession({ orgSlug, projectId, id }));

      if (
        workItem &&
        workItem.codeGenerationId &&
        workItem.sourceFiles?.length
      ) {
        const firstFilePath = workItem.sourceFiles[0].path;
        const normalizedFilePath = pathBrowser.isAbsolute(firstFilePath)
          ? pathBrowser.normalize(firstFilePath)
          : pathBrowser.normalize(pathBrowser.join(projectPath, firstFilePath));

        const original =
          await window.fileAPI.readFileContent(normalizedFilePath);
        setOriginalFileContent(original);

        await dispatch(fetchCodeGeneration(workItem.codeGenerationId));

        setShowCodeViewer(true);
      }
    } catch (err: any) {
      console.error('Error generating code:', err);
      notification.error({
        message: 'Code Generation Error',
        description: err.message || 'Failed to generate code',
      });
    }
  }, [orgSlug, projectId, id, dispatch, workItem, projectPath]);

  const handleApplyChanges = useCallback(async () => {
    if (!projectPath) {
      notification.error({ message: 'Project path not set!' });
      return;
    }
    try {
      const projName = projectPath.split(/[\\/]/).pop() || '';
      const files = codeGenState.latestFiles || {};

      await Promise.all(
        Object.entries(files).map(async ([key, content]) => {
          let absolutePath = key;
          if (key.startsWith(projName)) {
            const partial = key.slice(projName.length).replace(/^[/\\]+/, '');
            absolutePath = `${projectPath}/${partial}`;
          }
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
          .catch((err: any) => {
            console.error('Error auto-loading comparison file:', err);
          });
      }
    }
  }, [projectPath, codeGenState.latestFiles, showCodeViewer]);

  const fileTreeProps =
    codeGenState.latestFiles && Object.keys(codeGenState.latestFiles).length > 0
      ? baseFileSet && generatedFileSet
        ? { fileSets: [baseFileSet, generatedFileSet] }
        : {}
      : { projectPath };

  return (
    <Layout className={styles.promptGeneratorContainer}>
      <Layout className={styles['ide-container']}>
        <Sider width={360} className={styles.sider}>
          <div className={styles.siderInner}>
            <div
              className={
                codeGenState.latestFiles &&
                Object.keys(codeGenState.latestFiles).length > 0
                  ? styles.fileTreeContainerFlex
                  : styles.fileTreeContainer
              }
            >
              <FileTree
                {...fileTreeProps}
                onFileSelectionChange={handleMultipleSelect}
                onSingleSelect={handleSingleSelect}
                style={{
                  flex:
                    codeGenState.latestFiles &&
                    Object.keys(codeGenState.latestFiles).length > 0
                      ? 1
                      : undefined,
                  borderBottomLeftRadius: '8px',
                }}
              />
              {codeGenState.latestFiles &&
                Object.keys(codeGenState.latestFiles).length > 0 && (
                  <div className={styles.buttonContainer}>
                    <Button
                      type="primary"
                      block
                      className={styles.applyChangesBtn}
                      onClick={handleApplyChanges}
                    >
                      Apply Changes
                    </Button>
                  </div>
                )}
            </div>

            {(!codeGenState.latestFiles ||
              Object.keys(codeGenState.latestFiles).length === 0) && (
              <div className={styles.listBuilderContainer}>
                <ListBuilder
                  headerTitle="Rules"
                  options={rules.map((r) => ({
                    key: r.id,
                    label: r.title,
                    value: r.id,
                  }))}
                  onOptionClick={(opt) => {
                    setHasUserModified(true);
                    setSelectedRules((prev) =>
                      prev.includes(opt.value)
                        ? prev.filter((currentId) => currentId !== opt.value)
                        : [...prev, opt.value],
                    );
                  }}
                  selectionType="multiple"
                />
                <div className={styles.buttonContainer}>
                  <Button
                    block
                    className={styles.addPromptBtn}
                    onClick={() => console.log('Add new text prompt clicked')}
                  >
                    <PlusSquareFilled />
                    New Rule
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Sider>

        <Layout className={styles.mainLayout}>
          <Content className={styles.content}>
            {showCodeViewer ? (
              <CodeViewer
                originalCode={originalFileContent}
                modifiedCode={comparisonFileContent}
                code={originalFileContent}
                language="typescript"
              />
            ) : (
              <div className={styles.taskCreationContainer}>
                <TaskDescription
                  ref={taskDescRef}
                  onSend={handleSend}
                  mode="big"
                  onContentChange={() => {
                    setHasUserModified(true);
                    updateWorkItemDebounced();
                  }}
                />
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
