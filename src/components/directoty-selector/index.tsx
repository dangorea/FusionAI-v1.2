import { useEffect, useState } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, message, notification, Spin } from 'antd';
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
      const savedPath = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
      );
      const savedFileTree = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
      );

      setDirectoryPath(savedPath ?? null);

      if (savedPath) {
        window.api.setProjectPath(savedPath);
      }
    } else {
      notification.error({
        message: 'No projectId provided, resetting directoryPath.',
      });
      setDirectoryPath(null);
    }
  }, [projectId]);

  const handleSelectDirectory = async () => {
    setLoading(true);
    try {
      const result = await window.api.selectDirectory();

      if (!result.canceled) {
        const { directoryPath, fileTree } = result;

        if (projectId) {
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
            directoryPath,
          );
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
            JSON.stringify(fileTree),
          );
        }

        setDirectoryPath(directoryPath);
        window.api.setProjectPath(directoryPath);
        message.success('Directory selected successfully.');
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
