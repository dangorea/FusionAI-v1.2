import React, { useEffect, useRef, useState } from 'react';
import { Button, Layout, notification, Space } from 'antd';
import { useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { LocalStorageKeys } from '../../../utils/localStorageKeys';
import styles from './prompt-generator.module.scss';
import FileTree from '../../../components/file-tree';
import TaskDescriptionInput, {
  TaskDescriptionInputRef,
} from './components/task-description/task-description-input';
import CodeViewer from './components/CodeViewer';

const { Sider, Content } = Layout;

export function PromptGeneratorPage() {
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const [projectPath, setProjectPath] = useState<string>('');
  const taskDescRef = useRef<TaskDescriptionInputRef>(null);
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

  const handleMultipleSelect = async (filePaths: string[]) => {
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const content = await window.fileAPI.readFileContent(filePath);
        return { filePath, content };
      }),
    );
    setSelectedFiles(files);
  };

  const handleSingleSelect = async (filePath: string) => {
    const content = await window.fileAPI.readFileContent(filePath);
    console.log('Single file selected for preview:', { filePath, content });
  };

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

  console.log();

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
    <Layout style={{ background: '#F5F7FB' }}>
      <Space
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Sider width={300} className={styles.sider}>
          {projectPath ? (
            <FileTree
              rootPath={projectPath}
              onFileSelectionChange={handleMultipleSelect}
              onSingleSelect={handleSingleSelect}
            />
          ) : (
            <p>Please select a directory for this project.</p>
          )}
        </Sider>

        <Sider
          width={300}
          style={{ background: '#fff', padding: '16px' }}
          className={styles.sider}
        >
          <h3 style={{ marginBottom: '16px' }}>Rules</h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px', cursor: 'pointer' }}>Rule 1</li>
          </ul>
          <Button
            type="dashed"
            block
            style={{ marginTop: '16px' }}
            onClick={() => console.log('Add new text prompt clicked')}
          >
            Add new text prompt
          </Button>
        </Sider>
      </Space>

      <Layout>
        <Content className={styles.content} style={{ height: '100%' }}>
          {!showCodeViewer ? (
            <TaskDescriptionInput ref={taskDescRef} onSend={handleSend} />
          ) : (
            <CodeViewer
              originalFile={originalFileContent}
              comparisonFile={comparisonFileContent}
              onCommentsUpdate={(comments) =>
                console.log('Comments updated:', comments)
              }
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default PromptGeneratorPage;
