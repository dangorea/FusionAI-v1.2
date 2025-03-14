import React from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import { ListBuilder } from '../../../../components';
import styles from './history-panel.module.scss';

export interface HistoryOption {
  key: string;
  label: string;
  value: string;
}

interface HistoryPanelProps {
  historyOptions: HistoryOption[];
  handleHistoryOptionClick: (option: HistoryOption) => void;
  selectedHistoryId: string | null;
}

export function HistoryPanel({
  historyOptions,
  handleHistoryOptionClick,
  selectedHistoryId,
}: HistoryPanelProps) {
  return (
    <div className={styles['history-container']}>
      <ListBuilder
        headerTitle="History"
        options={historyOptions}
        headerIcon={<HistoryOutlined />}
        onOptionClick={handleHistoryOptionClick}
        selectedKeys={selectedHistoryId ? [selectedHistoryId] : []}
        selectionType="single"
      />
    </div>
  );
}
