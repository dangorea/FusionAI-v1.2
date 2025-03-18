import React from 'react';
import { Button, Layout } from 'antd';
import { PlusSquareFilled } from '@ant-design/icons';
import { FileTree, ListBuilder } from '../../../../components';
import styles from './sidebar.module.scss';

const { Sider } = Layout;

interface SidebarProps {
  fileTreeProps: any;
  codeGenExists: boolean;
  handleMultipleSelect: (filePaths: string[]) => void;
  handleSingleSelect: (filePath: string) => void;
  handleApplyChanges: () => void;
  rules: any[];
  setSelectedRules: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Sidebar({
  fileTreeProps,
  codeGenExists,
  handleMultipleSelect,
  handleSingleSelect,
  handleApplyChanges,
  rules,
  setSelectedRules,
}: SidebarProps) {
  return (
    <Sider width={360} className={styles.sider}>
      <div className={styles.siderInner}>
        <div
          className={
            codeGenExists
              ? styles.fileTreeContainerFlex
              : styles.fileTreeContainer
          }
        >
          <div style={{ maxHeight: '72vh' }}>
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
              >
                Apply Changes
              </Button>
            </div>
          )}
        </div>

        {!codeGenExists && (
          <div className={styles.listBuilderContainer}>
            <ListBuilder
              headerTitle="Rules"
              options={rules.map((r) => ({
                key: r.id,
                label: r.title,
                value: r.id,
              }))}
              onOptionClick={(opt) => {
                setSelectedRules((prev) =>
                  prev.includes(opt.value)
                    ? prev.filter((id) => id !== opt.value)
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
  );
}
