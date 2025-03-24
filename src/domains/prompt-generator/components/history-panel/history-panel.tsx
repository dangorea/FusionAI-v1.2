import React from 'react';
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ListOption } from '../../../../components';
import { ListBuilder, SlidePanel } from '../../../../components';
import styles from './history-panel.module.scss';

interface HistoryPanelProps {
  historyOptions: ListOption[];
  handleHistoryOptionClick: (option: ListOption) => void;
  selectedHistoryId: string | null;
  onEditFirstItem?: () => void;
}

export function HistoryPanel({
  historyOptions,
  handleHistoryOptionClick,
  selectedHistoryId,
  onEditFirstItem,
}: HistoryPanelProps) {
  const decoratedOptions = historyOptions.map((opt, index) => {
    if (index === 0 && onEditFirstItem) {
      return {
        ...opt,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{opt.label}</span>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                onEditFirstItem();
              }}
            />
          </div>
        ),
      };
    }
    return opt;
  });

  const panelContent = (
    <div className={styles['history-container']}>
      <ListBuilder
        headerTitle="History"
        options={decoratedOptions}
        headerIcon={<HistoryOutlined />}
        onOptionClick={handleHistoryOptionClick}
        selectedKeys={selectedHistoryId ? [selectedHistoryId] : []}
        selectionType="single"
      />
    </div>
  );

  return (
    <SlidePanel direction="right" panelWidth="10%" defaultOpen>
      {panelContent}
    </SlidePanel>
  );
}
