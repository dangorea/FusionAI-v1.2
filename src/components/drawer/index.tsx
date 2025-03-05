import { Button, Drawer, List } from 'antd';
import { useMemo } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { DrawerOption, MenuOptions } from '../../constants/drawer-options';
import styles from './drawer.module.scss';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function DrawerRenderer({ open, onClose }: DrawerProps) {
  const menuOptions = useMemo(() => MenuOptions, []);

  const optionToPath = (option: DrawerOption) => {
    switch (option) {
      case DrawerOption.Organizations:
        return '/organizations';
      case DrawerOption.Projects:
        return '/projects';
      case DrawerOption.TextBlocks:
        return '/text-blocks';
      case DrawerOption.Settings:
        return '/settings';
      case DrawerOption.WorkItems:
        return '/work-items';
      case DrawerOption.OrganizationManagement:
        return '/organization-management';
      default:
        return '/';
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="left"
      width={250}
      styles={{ header: { display: 'none' }, body: { padding: '0px' } }}
    >
      <Button className={styles['close-button']} onClick={onClose}>
        <LeftOutlined />
      </Button>
      <List>
        {menuOptions.map((option) => (
          <List.Item key={option.text} className={styles['list-item']}>
            <Link
              to={optionToPath(option.text as DrawerOption)}
              className={styles.text}
              onClick={onClose}
            >
              <option.icon className={styles.icon} />
              {option.text}
            </Link>
          </List.Item>
        ))}
      </List>
    </Drawer>
  );
}
