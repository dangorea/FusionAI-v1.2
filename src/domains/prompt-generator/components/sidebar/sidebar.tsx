import React, { useMemo } from 'react';
import { Button, Layout } from 'antd';
import { FileTree } from '../../../../components';
import styles from './sidebar.module.scss';
import { useResizablePanel } from '../../../../hooks/useResizablePanel';

const { Sider } = Layout;

interface SidebarProps {
  fileTreeProps: any;
  codeGenExists: boolean;
  handleMultipleSelect: (filePaths: string[]) => void;
  handleSingleSelect: (filePath: string) => void;
  handleApplyChanges: () => void;
  sidebarSelectedFiles: Record<string, string>;
}

export function Sidebar({
  fileTreeProps,
  codeGenExists,
  handleMultipleSelect,
  handleSingleSelect,
  handleApplyChanges,
  sidebarSelectedFiles,
}: SidebarProps) {
  const { panelRef, panelWidth, startResizing } = useResizablePanel({
    direction: 'left',
  });

  const disableApplyButton = useMemo(
    () => Object.keys(sidebarSelectedFiles).length === 0,
    [sidebarSelectedFiles],
  );

  if (!codeGenExists) {
    return null;
  }

  return (
    <Sider ref={panelRef} width={panelWidth} className={styles.sider}>
      <div className={styles.siderInner}>
        <div
          className={
            codeGenExists
              ? styles.fileTreeContainerFlex
              : styles.fileTreeContainer
          }
        >
          <div style={{ maxHeight: '92%' }}>
            <FileTree
              {...fileTreeProps}
              onFileSelectionChange={handleMultipleSelect}
              onSingleSelect={handleSingleSelect}
              style={{
                flex: codeGenExists ? 1 : undefined,
                borderBottomLeftRadius: '8px',
              }}
            />
          </div>

          {codeGenExists && (
            <div className={styles.buttonContainer}>
              <Button
                type="primary"
                block
                className={styles.applyChangesBtn}
                onClick={handleApplyChanges}
                disabled={disableApplyButton}
              >
                Apply Changes
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        role="presentation"
        className={styles.resizer}
        onMouseDown={startResizing}
      />
    </Sider>
  );
}
