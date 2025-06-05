import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import styles from './DirectorySelector.module.scss';

type DirectorySelectorProps = {
  loading: boolean;
  handleSelectDirectory: () => void;
  directoryPath: string | null;
};

export function DirectorySelector({
  loading,
  handleSelectDirectory,
  directoryPath,
}: DirectorySelectorProps) {
  const icon: ReactNode = useMemo(() => {
    if (loading) {
      return (<Spin size="small" />) as ReactNode;
    }
    return (<FolderOpenOutlined />) as ReactNode;
  }, [loading]);

  return (
    <div className={styles['directory-header']}>
      <Button icon={icon} onClick={handleSelectDirectory} disabled={loading} />
      <span className={styles['selected-directory']}>
        {directoryPath ?? 'Select a directory'}
      </span>
    </div>
  );
}
