import { useEffect, useState } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, message, Spin } from 'antd';
import styles from './DirectorySelector.module.scss';
import { LocalStorageKeys } from '../../utils/localStorageKeys';

type DirectorySelectorProps = {
  projectId: string | null;
};

export const DirectorySelector = ({ projectId }: DirectorySelectorProps) => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (projectId) {
      console.log(`Attempting to load data for projectId: ${projectId}`);

      const savedPath = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
      );
      const savedFileTree = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
      );

      console.log(
        `Loaded Path for projectId ${projectId}:`,
        savedPath ?? 'No path found',
      );
      console.log(
        `Loaded File Tree for projectId ${projectId}:`,
        savedFileTree ?? 'No file tree found',
      );

      setDirectoryPath(savedPath ?? null);

      if (savedPath) {
        window.api.setProjectPath(savedPath);
      }

      if (savedFileTree) {
        try {
          const fileTree = JSON.parse(savedFileTree);
          console.log(`Parsed File Tree for projectId ${projectId}:`, fileTree);
        } catch (error) {
          console.error(
            `Failed to parse file tree for projectId ${projectId}:`,
            error,
          );
        }
      }
    } else {
      console.log('No projectId provided, resetting directoryPath.');
      setDirectoryPath(null);
    }
  }, [projectId]);

  const handleSelectDirectory = async () => {
    setLoading(true);
    try {
      const result = await window.api.selectDirectory();

      if (!result.canceled) {
        const { directoryPath, fileTree } = result;

        console.log('Directory selected:', directoryPath);
        console.log('File Tree returned:', fileTree);

        if (projectId) {
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
            directoryPath,
          );
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
            JSON.stringify(fileTree),
          );

          console.log(
            `Saved directoryPath for projectId ${projectId}:`,
            directoryPath,
          );
          console.log(`Saved fileTree for projectId ${projectId}:`, fileTree);
        }

        setDirectoryPath(directoryPath);
        window.api.setProjectPath(directoryPath);
        message.success('Directory selected successfully.');
      } else {
        console.log('Directory selection canceled by user.');
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      message.error('Failed to select directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['directory-header']}>
      <Button
        icon={loading ? <Spin size="small" /> : <FolderOpenOutlined />}
        onClick={handleSelectDirectory}
        disabled={loading}
      />
      <span className={styles['selected-directory']}>
        {directoryPath ?? 'Select a directory'}
      </span>
    </div>
  );
};
