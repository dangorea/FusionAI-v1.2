import React from 'react';
import { Button, Drawer, List, Typography } from 'antd';
import {
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import styles from './HistoryComponent.module.scss';

const { Text } = Typography;

interface Iteration {
  id: string;
  prompt: string;
  isActive: boolean;
}

interface HistoryComponentProps {
  iterations: Iteration[];
  activeIterationId: string;
  onSelectIteration: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const HistoryComponent: React.FC<HistoryComponentProps> = ({
  iterations,
  activeIterationId,
  onSelectIteration,
  isCollapsed,
  onToggleCollapse,
}) => {
  const activeIndex = iterations.findIndex(
    (iter) => iter.id === activeIterationId,
  );

  return (
    <Drawer
      title={
        <div onClick={onToggleCollapse} className={styles.header}>
          <ClockCircleOutlined className={styles.icon} />
          <Text strong>History</Text>
        </div>
      }
      placement="right"
      closable={false}
      open
      width={isCollapsed ? 105 : 300}
      onClose={onToggleCollapse}
      mask={false}
      extra={
        !isCollapsed && (
          <Button
            type="link"
            icon={<LeftOutlined />}
            onClick={onToggleCollapse}
          />
        )
      }
    >
      <List
        dataSource={iterations}
        renderItem={(iteration: Iteration, index: number) => {
          const isActive = iteration.id === activeIterationId;
          const isBelowActive = index > activeIndex;

          return (
            <List.Item
              className={`${styles.listItem} ${
                isActive ? styles.activeItem : ''
              } ${isBelowActive ? styles.inactiveItem : ''}`}
              onClick={() => onSelectIteration(iteration.id)}
            >
              <Text className={styles.itemText}>{iteration.prompt}</Text>
            </List.Item>
          );
        }}
      />

      <Button
        style={{ backgroundColor: 'transparent' }}
        type="text"
        icon={isCollapsed ? <RightOutlined /> : <LeftOutlined />}
        onClick={onToggleCollapse}
      />
    </Drawer>
  );
};

export default HistoryComponent;
