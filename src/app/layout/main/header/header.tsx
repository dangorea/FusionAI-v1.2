import { Button, Layout } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './header.module.scss';
import { OrganizationDropdown } from '../../../../domains/organization/components';
import { ProjectsDropdown } from '../../../../domains/project/components';
import UserAvatarMenu from '../../../../components/user-avatar-menu';
import { CreateButton, PageTitle } from './components';

const { Header } = Layout;

type AppHeaderProps = {
  currentPath: string;
  onOpenDrawer: () => void;
  onBackToWorkItems: () => void;
  onCreateWorkItem: () => void;
};

export default function LayoutHeader({
  currentPath,
  onOpenDrawer,
  onBackToWorkItems,
  onCreateWorkItem,
}: AppHeaderProps) {
  return (
    <Header className={styles.header}>
      <Button
        type="default"
        icon={
          <MenuOutlined
            style={{ fontSize: 24 }}
            className={styles['menu-icon']}
          />
        }
        onClick={onOpenDrawer}
        className={styles.burgerBtn}
      />
      <PageTitle
        currentPath={currentPath}
        onBackToWorkItems={onBackToWorkItems}
      />
      <div className={styles.content}>
        <CreateButton onCreateWorkItem={onCreateWorkItem} />
        <OrganizationDropdown />
        <ProjectsDropdown />
        <UserAvatarMenu />
      </div>
    </Header>
  );
}
