import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Layout, notification } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import styles from './prompt-generator.module.scss';
import { FileTree, ListBuilder } from '../../../components';
import type { TaskDescriptionInputRef } from '../components';
import { CodeViewer, TaskDescription } from '../components';
import { selectAllRules } from '../../../lib/redux/feature/rules/selectors';
import { createCodeGenerationSession } from '../../../api/code-generations';
import { updateWorkItem } from '../../../api/work-items';
import codeGenerationHistoryService from '../../../database/code-generation-history';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';

const { Sider, Content } = Layout;

export function PromptGenerator() {
  const { id } = useParams();
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const rules = useAppSelector(selectAllRules);
  const projectId = useAppSelector(selectSelectedProjectId);
  const orgSlug = org?.slug;
  const [projectPath, setProjectPath] = useState<string>('');
  const taskDescRef = useRef<TaskDescriptionInputRef>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    { filePath: string; content: string }[]
  >([]);
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [comparisonFileContent, setComparisonFileContent] =
    useState<string>('');
  const [historyOptions, setHistoryOptions] = useState<
    { key: string; label: string; value: string }[]
  >([]);
  const watchedFiles = useRef<Set<string>>(new Set());

  // New state to track selected rules (by their IDs)
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  // New flag to track if the user has interacted with any field.
  const [hasUserModified, setHasUserModified] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedProjectId) return;
    const savedPath = localStorage.getItem(
      `${selectedProjectId}-${LocalStorageKeys.PROJECT_PATHS}`,
    );
    if (savedPath) {
      setProjectPath(savedPath);
    }
  }, [selectedProjectId]);

  const removeAllFileBlocks = (text: string): string => {
    const pattern =
      /\n\n=== File: .*? ===\n[\s\S]*?\n=== EndFile: .*? ===\n\n/g;
    return text.replace(pattern, '');
  };

  const handleMultipleSelect = useCallback(async (filePaths: string[]) => {
    setHasUserModified(true);
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const content = await window.fileAPI.readFileContent(filePath);
        return { filePath, content };
      }),
    );
    setSelectedFiles(files);
  }, []);

  const handleSingleSelect = useCallback(async (filePath: string) => {
    setHasUserModified(true);
    const content = await window.fileAPI.readFileContent(filePath);
    console.log('Single file selected for preview:', { filePath, content });
  }, []);

  useEffect(() => {
    if (taskDescRef.current) {
      const currentContent = taskDescRef.current.getContent();
      const cleanedContent = removeAllFileBlocks(currentContent);
      taskDescRef.current.setContent(cleanedContent);
      selectedFiles.forEach((file) => {
        taskDescRef.current?.addExtraContent(
          `\n\n=== File: ${file.filePath} ===\n${file.content}\n=== EndFile: ${file.filePath} ===\n\n`,
        );
      });
    }
  }, [selectedFiles]);

  const updateWorkItemHandler = async () => {
    if (!hasUserModified) {
      return;
    }

    const taskDescription = taskDescRef.current?.getContent() || '';
    const sourceFiles = selectedFiles.map((file) => ({
      path: file.filePath,
      content: file.content,
    }));
    const textBlocks = selectedRules
      .map((ruleId) => {
        const rule = rules.find((r) => r.id === ruleId);
        if (rule) {
          return { id: rule.id, title: rule.title, details: rule.title };
        }
        return null;
      })
      .filter(Boolean);

    const payload = { taskDescription, sourceFiles, textBlocks };

    try {
      if (orgSlug && projectId) {
        await updateWorkItem(orgSlug, projectId, {
          id,
          ...payload,
        });
      }
    } catch (err: any) {
      console.error('Failed to update work item:', err);
      notification.error({
        message: 'Work item update failed',
        description:
          err.message || 'An error occurred while updating the work item.',
      });
    }
  };

  const debouncedUpdate = useCallback(
    debounce(() => {
      updateWorkItemHandler();
    }, 900),
    [selectedFiles, selectedRules, rules, hasUserModified],
  );

  // Trigger update when selectedFiles, selectedRules, or rules change.
  useEffect(() => {
    debouncedUpdate();
    return () => debouncedUpdate.cancel();
  }, [selectedFiles, selectedRules, rules, debouncedUpdate]);

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('file-changed', ((data: {
      filePath: string;
      content: string;
    }) => {
      setHasUserModified(true);
      setSelectedFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.filePath === data.filePath
            ? { ...file, content: data.content }
            : file,
        ),
      );
      const rootFolder = projectPath ? projectPath.split(/[\\/]/).pop() : '';
      const relativePath =
        projectPath && data.filePath.startsWith(projectPath)
          ? data.filePath.slice(projectPath.length)
          : data.filePath;
      notification.info({
        message: `${rootFolder} File Updated`,
        description: `File changed: ${relativePath}`,
      });
    }) as (...args: unknown[]) => void);
    return () => {
      unsubscribe();
    };
  }, [projectPath]);

  useEffect(() => {
    const newFilePaths = new Set(selectedFiles.map((file) => file.filePath));
    newFilePaths.forEach((filePath) => {
      if (!watchedFiles.current.has(filePath)) {
        window.fileAPI.watchFile(filePath);
        watchedFiles.current.add(filePath);
      }
    });
    watchedFiles.current.forEach((filePath) => {
      if (!newFilePaths.has(filePath)) {
        window.fileAPI.unwatchFile(filePath);
        watchedFiles.current.delete(filePath);
      }
    });
  }, [selectedFiles]);

  const handleSend = async (content: string) => {
    setHasUserModified(true);
    console.log('User clicked send, content:', content);
    if (selectedFiles.length > 0) {
      setOriginalFileContent(selectedFiles[0].content);
    }
    try {
      const response = await createCodeGenerationSession({ prompt: content });
      const promptLabel = content.trim().substring(0, 50);
      const sessionHistory = {
        sessionId: response._id,
        promptLabel,
      };
      await codeGenerationHistoryService.saveSession(sessionHistory);
      setComparisonFileContent(
        selectedFiles.length > 0 ? selectedFiles[0].content : '',
      );
      setShowCodeViewer(true);
    } catch (error: any) {
      console.error('Error generating code:', error);
      notification.error({
        message: 'Code Generation Error',
        description: error.message || 'Failed to generate code',
      });
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      const sessions = await codeGenerationHistoryService.getAllSessions();
      const options = sessions.map((session) => ({
        key: session.sessionId,
        label: session.promptLabel,
        value: session.sessionId,
      }));
      setHistoryOptions(options);
    };

    loadHistory();

    const historyUpdateHandler = (sessions: any[]) => {
      const options = sessions.map((session) => ({
        key: session.sessionId,
        label: session.promptLabel,
        value: session.sessionId,
      }));
      setHistoryOptions(options);
    };

    codeGenerationHistoryService.subscribe(historyUpdateHandler);
    return () => {
      codeGenerationHistoryService.unsubscribe(historyUpdateHandler);
    };
  }, []);

  const handleHistoryOptionClick = async (option: {
    key: string;
    label: string;
    value: string;
  }) => {
    const session = await codeGenerationHistoryService.getByKey(option.key);
    if (session) {
      notification.info({
        message: 'History Session',
        description: `Session ID: ${session.sessionId}\nPrompt: ${session.promptLabel}`,
      });
    } else {
      notification.info({
        message: 'No history found for the selected option.',
      });
    }
  };

  // Handler for when a rule is clicked in the ListBuilder.
  // This toggles the rule in the selectedRules state.
  const handleRuleOptionClick = (option: {
    key: string;
    label: string;
    value: string;
  }) => {
    setHasUserModified(true);
    setSelectedRules((prev) =>
      prev.includes(option.value)
        ? prev.filter((ruleId) => ruleId !== option.value)
        : [...prev, option.value],
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F7FB' }}>
      <Sider
        width={360}
        theme="light"
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          padding: '16px 0',
        }}
      >
        <div style={{ padding: '0 16px' }}>
          <FileTree
            rootPath={projectPath}
            onFileSelectionChange={handleMultipleSelect}
            onSingleSelect={handleSingleSelect}
          />
          <div style={{ marginTop: 16 }}>
            <ListBuilder
              headerTitle="Rules"
              options={rules.map((rule) => ({
                key: rule.id,
                label: rule.title,
                value: rule.id,
              }))}
              onOptionClick={handleRuleOptionClick}
              selectionType="multiple"
            />
          </div>
          <Button
            type="dashed"
            block
            style={{ marginTop: 16 }}
            onClick={() => console.log('Add new text prompt clicked')}
          >
            Add new text prompt
          </Button>
        </div>
      </Sider>
      <Layout style={{ background: '#F5F7FB' }}>
        <Content
          className={styles.content}
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!showCodeViewer ? (
              <TaskDescription
                ref={taskDescRef}
                onSend={handleSend}
                onContentChange={() => {
                  setHasUserModified(true);
                  debouncedUpdate();
                }}
              />
            ) : (
              <CodeViewer
                originalCode={originalFileContent}
                modifiedCode={comparisonFileContent}
                code={originalFileContent}
                language="typescript"
              />
            )}
          </div>
        </Content>
      </Layout>
      <Sider
        collapsedWidth={250}
        width={250}
        theme="light"
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          padding: '16px 0',
        }}
      >
        <div style={{ padding: '0 16px' }}>
          <div style={{ marginTop: 16 }}>
            <ListBuilder
              headerTitle="History"
              options={historyOptions}
              headerIcon={<HistoryOutlined />}
              onOptionClick={handleHistoryOptionClick}
            />
          </div>
        </div>
      </Sider>
    </Layout>
  );
}
