import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import {
  getProjectPath,
  saveProjectPath,
  saveProjectFileTree,
} from '../../utils/project/path';

const useDirectorySelector = (projectId: string | null) => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) {
      setDirectoryPath(null);
      setFileTree(null);
      window.api.setProjectPath('');
      return;
    }

    const savedPath = getProjectPath(projectId);
    if (savedPath) {
      setDirectoryPath(savedPath);
      window.api.setProjectPath(savedPath);
    } else {
      setDirectoryPath(null); // ← clears stale value
      window.api.setProjectPath('');
    }

    setFileTree(null);
  }, [projectId]);

  const handleSelectDirectory = useCallback(() => {
    setLoading(true);
    return (
      window.api.selectDirectory() as unknown as Promise<{
        canceled: boolean;
        directoryPath: string;
        fileTree: any;
      }>
    )
      .then((result) => {
        if (!result.canceled) {
          setDirectoryPath(result.directoryPath);
          setFileTree(result.fileTree);
          message.success('Directory selected successfully.');
        }
      })
      .catch((error) => {
        console.error('Error selecting directory:', error);
        message.error('Failed to select directory.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveDirectory = useCallback(
    (id: string) => {
      if (directoryPath && fileTree) {
        saveProjectPath(id, directoryPath);
        saveProjectFileTree(id, fileTree);
        window.api.setProjectPath(directoryPath);
      }
    },
    [directoryPath, fileTree],
  );

  return { handleSelectDirectory, handleSaveDirectory, loading, directoryPath };
};

export { useDirectorySelector };
