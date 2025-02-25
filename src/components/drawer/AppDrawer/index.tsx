import { Button, Drawer, List } from 'antd';
import { FC, useMemo } from 'react';
import { DrawerOption, MenuOptions } from './consts';
import { LeftOutlined } from '@ant-design/icons';
import styles from './AppDrawer.module.scss';

type DrawerProps = {
  open: boolean;
  onPageSelected: (option: DrawerOption) => void;
  onClose: () => void;
};

export const AppDrawer: FC<DrawerProps> = ({
  open,
  onPageSelected,
  onClose,
}) => {
  const menuOptions = useMemo(() => MenuOptions, []);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="left"
      width={250}
      styles={{
        header: { display: 'none' },
        body: { padding: '0px' },
      }}
    >
      <Button className={styles['close-button']} onClick={onClose}>
        <LeftOutlined />
      </Button>
      <List>
        {menuOptions.map((option) => (
          <List.Item
            key={option.text}
            className={styles['list-item']}
            onClick={() => onPageSelected(option.text as DrawerOption)}
          >
            <option.icon className={styles['icon']} />
            {option.text}
          </List.Item>
        ))}
      </List>
    </Drawer>
  );
};
