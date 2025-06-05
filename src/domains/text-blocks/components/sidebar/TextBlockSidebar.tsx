import React, { useMemo } from 'react';
import { List, Typography } from 'antd';
import type { TextBlockType } from '../../../../lib/redux/feature/text-blocks/types';
import styles from './text-block-sidebar.module.scss';

const { Text } = Typography;

interface TextBlockSidebarProps {
  textBlocks: TextBlockType[];
  onSelectTextBlock: (textBlock: TextBlockType) => void;
  selectedTextBlockId: string | null;
  searchValue?: string;
}

export function TextBlockSidebar({
  textBlocks,
  onSelectTextBlock,
  selectedTextBlockId,
  searchValue = '',
}: TextBlockSidebarProps) {
  const filteredTextBlocks = useMemo(() => {
    if (!searchValue.trim()) {
      return textBlocks;
    }

    const searchTermLower = searchValue.toLowerCase();
    return textBlocks.filter(
      (block) =>
        block.name.toLowerCase().includes(searchTermLower) ||
        block.content.toLowerCase().includes(searchTermLower),
    );
  }, [textBlocks, searchValue]);

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.listContainer}>
        {filteredTextBlocks.length === 0 ? (
          <div className={styles.emptyState}>
            <Text type="secondary">No items found</Text>
          </div>
        ) : (
          <List
            dataSource={filteredTextBlocks}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                onClick={() => onSelectTextBlock(item)}
                className={`${styles.listItem} ${selectedTextBlockId === item.id ? styles.selectedItem : ''}`}
              >
                <Text ellipsis>{item.name}</Text>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
