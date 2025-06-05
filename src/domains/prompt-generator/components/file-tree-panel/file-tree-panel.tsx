import React, { useState } from 'react';
import { FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import styles from './file-tree-panel.module.scss';
import type { FileTreeProps, ListOption } from '../../../../components';
import {
  CollapsibleSidePanel,
  FileTree,
  ListBuilder,
  MarkdownEditor,
} from '../../../../components';

interface FileTreePanelProps {
  fileTreeProps: FileTreeProps;
  handleMultipleSelect: (filePaths: string[]) => void;
  handleSingleSelect: (filePath: string) => void;
  rules: Array<{ id: string; name: string; content?: string }>;
  selectedRules: string[];
  onRulesSelected: (newRuleIds: string[]) => void;
  workItemId?: string;
}

export function FileTreePanel({
  fileTreeProps,
  handleMultipleSelect,
  handleSingleSelect,
  rules,
  selectedRules,
  onRulesSelected,
  workItemId,
}: FileTreePanelProps) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const headerContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifySelf: 'flex-end',
      }}
    >
      <span>Context</span>
    </div>
  );

  const fileTreePanelProps = {
    ...fileTreeProps,
    fileSets: fileTreeProps.fileSets
      ? [fileTreeProps.fileSets[0]]
      : fileTreeProps.fileSets,
  };

  const handleLabelClick = (option: ListOption) => {
    setName(option.label as string);
    setContent(option.content ?? '');
    setDrawerVisible(true);
  };

  return (
    <CollapsibleSidePanel
      collapseDirection="left"
      responsiveThreshold={1260}
      collapsedWidth="60px"
      header={headerContent}
      extraHeaderIcon={
        <FolderOpenOutlined
          style={{
            color: '#7B85DA',
          }}
        />
      }
      className={styles.fileTreePanelContainer}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      headerClassName={styles.fileTreePanelHeader}
    >
      <div className={styles.mainContainer}>
        <div
          className={styles.sectionDescription}
          style={{
            padding: '0 8px 8px 20px',
            borderBottom: '1px solid #ddd',
            marginBottom: '8px',
          }}
        >
          File tree
        </div>
        <div className={styles.fileTreeContainer}>
          <FileTree
            key={`panel-file-tree-${workItemId}`}
            {...fileTreePanelProps}
            onFileSelectionChange={handleMultipleSelect}
            onSingleSelect={handleSingleSelect}
          />
        </div>
        <div className={styles.listBuilderContainer}>
          <div className={styles.listBuilderHeader}>
            <div className={styles.sectionDescription}>Knowledge Base</div>
            <div>
              <PlusOutlined />
            </div>
          </div>
          <ListBuilder
            key={`panel-list-builder-${workItemId}`}
            options={rules.map((r) => ({
              key: r.id,
              label: r.name,
              value: r.id,
              content: r.content,
            }))}
            onOptionClick={(opt) => {
              const newRuleIds = selectedRules.includes(opt.value)
                ? selectedRules.filter((id) => id !== opt.value)
                : [...selectedRules, opt.value];

              onRulesSelected(newRuleIds);
            }}
            onLabelClick={(option) => handleLabelClick(option)}
            selectedKeys={selectedRules}
            selectionType="multiple"
            containerStyle={{ margin: '20px 0 0 0' }}
            useCheckboxes
          />
        </div>
        <Drawer
          placement="right"
          closable
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          key="right"
          size="large"
          title={name}
        >
          <div className={styles.editorContent}>
            <MarkdownEditor
              value={content}
              onChange={() => {}}
              mode="preview"
            />
          </div>
        </Drawer>
      </div>
    </CollapsibleSidePanel>
  );
}
