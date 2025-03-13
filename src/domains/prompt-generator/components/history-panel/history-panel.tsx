import React from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import { ListBuilder } from '../../../../components';
import styles from './history-panel.module.scss';

interface HistoryPanelProps {
  historyOptions: { key: string; label: string; value: string }[];
  handleHistoryOptionClick: (option: {
    key: string;
    label: string;
    value: string;
  }) => void;
}

export function HistoryPanel({
  historyOptions,
  handleHistoryOptionClick,
}: HistoryPanelProps) {
  return (
    <div className={styles['history-container']}>
      <ListBuilder
        headerTitle="History"
        options={historyOptions}
        headerIcon={<HistoryOutlined />}
        onOptionClick={handleHistoryOptionClick}
      />
    </div>
  );
}
