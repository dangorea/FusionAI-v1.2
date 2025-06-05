import React from 'react';
import { Button, Input, Radio } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './text-block-header.module.scss';

interface TextBlockHeaderProps {
  scope: 'organization' | 'project';
  onScopeChange: (scope: 'organization' | 'project') => void;
  onSearch?: (value: string) => void;
  onCreateNew?: () => void;
  searchValue?: string;
}

export function TextBlockHeader({
  scope,
  onScopeChange,
  onSearch,
  onCreateNew,
  searchValue = '',
}: TextBlockHeaderProps) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.searchContainer}>
        <Input
          placeholder="Search items..."
          value={searchValue}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          className={styles.searchField}
        />
      </div>

      <div className={styles.actionContainer}>
        <Radio.Group
          value={scope}
          onChange={(e) => onScopeChange(e.target.value)}
          className={styles.scopeToggle}
        >
          <Radio.Button value="organization">Organization</Radio.Button>
          <Radio.Button value="project">Project</Radio.Button>
        </Radio.Group>

        {onCreateNew && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
            className={styles.createButton}
          />
        )}
      </div>
    </div>
  );
}
