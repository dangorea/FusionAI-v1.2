import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './style.module.scss';
import { useAppSelector } from '../../../../../../lib/redux/hook';
import { selectAllWorkItems } from '../../../../../../lib/redux/feature/work-items/selectors';
import { TextBlockCategory } from '../../../../../../lib/redux/feature/text-blocks/types';

type Props = {
  currentPath: string;
  onBackToWorkItems: () => void;
};

export function PageTitle({ currentPath, onBackToWorkItems }: Props) {
  const allWorkItems = useAppSelector(selectAllWorkItems);

  const getPageTitle = (path: string) => {
    if (path.includes('organizations')) return 'Organizations';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('work-items')) return 'Work Items';
    if (path.includes('rules')) return 'Knowledge Base';
    if (path.includes(TextBlockCategory.PERSONALITY)) return 'Personalities';
    if (path.includes('organization-management'))
      return 'Organization Management';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('prompt-generator')) {
      const workItemId = path.split('/')[2];
      const workItem = allWorkItems.find((item) => item.id === workItemId);

      return workItem?.name || 'Prompt Generator';
    }
    return '';
  };

  return (
    <div className={styles['page-title-container']}>
      {currentPath.includes('prompt-generator') && (
        <Button
          type="text"
          icon={<LeftOutlined className={styles['left-icon']} />}
          onClick={onBackToWorkItems}
          style={{ marginRight: '8px' }}
        />
      )}
      <div className={styles.title}>{getPageTitle(currentPath)}</div>
    </div>
  );
}
