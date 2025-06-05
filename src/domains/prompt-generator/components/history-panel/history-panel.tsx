import React from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import type { ListOption } from '../../../../components';
import { CollapsibleSidePanel, ListBuilder } from '../../../../components';
import styles from './history-panel.module.scss';

interface HistoryPanelProps {
  historyOptions: ListOption[];
  handleHistoryOptionClick: (option: ListOption) => void;
  selectedHistoryId: string | null;
  workItemId?: string;
}

export function HistoryPanel({
  historyOptions,
  handleHistoryOptionClick,
  selectedHistoryId,
  workItemId,
}: HistoryPanelProps) {
  const headerContent = (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
      }}
    >
      <span>History</span>
    </div>
  );

  return (
    <CollapsibleSidePanel
      collapseDirection="right"
      responsiveThreshold={1260}
      collapsedWidth="60px"
      header={headerContent}
      extraHeaderIcon={
        <HistoryOutlined
          style={{
            color: '#7B85DA',
          }}
        />
      }
      className={`${styles.historyPanelContainer}`}
      headerClassName={styles.fileTreePanelHeader}
      style={{ height: '100%' }}
    >
      <ListBuilder
        key={`history-panel-list-builder-${workItemId}`}
        containerStyle={{
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          border: 'none',
        }}
        options={historyOptions}
        onOptionClick={handleHistoryOptionClick}
        selectedKeys={selectedHistoryId ? [selectedHistoryId] : []}
        selectionType="single"
      />
    </CollapsibleSidePanel>
  );
}
