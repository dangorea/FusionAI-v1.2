import { useEffect, useState } from 'react';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './DirectorySelector.module.scss';
import { LocalStorageKeys } from '../../utils/localStorageKeys';

type DirectorySelectorProps = {
  projectId: string | null;
};

export function DirectorySelector({ projectId }: DirectorySelectorProps) {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const savedPath = localStorage.getItem(
        `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
      );

      setDirectoryPath(savedPath ?? null);

      if (savedPath) {
        window.api.setProjectPath(savedPath);
      }
    } else {
      setDirectoryPath(null);
    }
  }, [projectId]);

  const handleSelectDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();

      if (!result.canceled) {
        const { fileTree } = result;

        if (projectId) {
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
            directoryPath!,
          );
          localStorage.setItem(
            `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
            JSON.stringify(fileTree),
          );
        }

        setDirectoryPath(directoryPath);

        window.api.setProjectPath(directoryPath);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  return (
    <div className={styles['directory-header']}>
      <Button icon={<FolderOpenOutlined />} onClick={handleSelectDirectory} />
      <span className={styles['selected-directory']}>
        {directoryPath ?? 'Select a directory'}
      </span>
    </div>
  );
}
