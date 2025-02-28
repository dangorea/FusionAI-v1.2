import { ElementType, FC } from 'react';
import { Button } from 'antd';
import styles from './CardHeader.module.scss';

type CardHeaderProps = {
  title: string;
  actions?: {
    title: string;
    icon?: ElementType;
    onClick?: () => void;
  }[];
};

export const CardHeader: FC<CardHeaderProps> = ({ title, actions = [] }) => (
  <div className={styles['card-header']}>
    <h3>{title}</h3>
    <div className={styles.actions}>
      {actions.map((action, index) => (
        <Button
          key={index}
          type="primary"
          icon={action.icon ? <action.icon /> : null}
          onClick={action.onClick}
          title={action.title}
          size="small"
        >
          {action.title}
        </Button>
      ))}
    </div>
  </div>
);
