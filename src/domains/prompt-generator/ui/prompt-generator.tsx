import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Layout, notification } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import styles from './prompt-generator.module.scss';
import { FileTree, ListBuilder } from '../../../components';
import type { TaskDescriptionInputRef } from '../components';
import { CodeViewer, TaskDescription } from '../components';
import { selectAllRules } from '../../../lib/redux/feature/rules/selectors';

const { Sider, Content } = Layout;

export function PromptGenerator() {
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const [projectPath, setProjectPath] = useState<string>('');
  const taskDescRef = useRef<TaskDescriptionInputRef>(null);
  const rules = useAppSelector(selectAllRules);
  const [selectedFiles, setSelectedFiles] = useState<
    { filePath: string; content: string }[]
  >([]);

  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);

  const [originalFileContent, setOriginalFileContent] = useState<string>('');
  const [comparisonFileContent, setComparisonFileContent] =
    useState<string>('');

  const watchedFiles = useRef<Set<string>>(new Set());

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
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const content = await window.fileAPI.readFileContent(filePath);
        return { filePath, content };
      }),
    );
    setSelectedFiles(files);
  }, []);

  const handleSingleSelect = useCallback(async (filePath: string) => {
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

  const handleSend = (content: string) => {
    console.log('User clicked send, content:', content);
    if (selectedFiles.length > 0) {
      setOriginalFileContent(selectedFiles[0].content);
      setComparisonFileContent(
        selectedFiles[1] ? selectedFiles[1].content : selectedFiles[0].content,
      );
    }
    setShowCodeViewer(true);
  };

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('file-changed', ((data: {
      filePath: string;
      content: string;
    }) => {
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
              <TaskDescription ref={taskDescRef} onSend={handleSend} />
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
              options={[]}
              headerIcon={<HistoryOutlined />}
            />
          </div>
        </div>
      </Sider>
    </Layout>
  );
}
