import { Button, Layout } from 'antd';
import {
  ArrowLeftOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import styles from './main-layout.module.scss';
import { OrganizationDropdown } from '../../../components/OrganizationBlock/OrganizationDropDown';
import { ProjectsDropdown } from '../../../components/Project/ProjectsDropdown';
import UserAvatar from './UserAvatar';
import LogoutButton from './logout-button';

const { Header, Content } = Layout;

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
  const getPageTitle = (path: string) => {
    if (path.includes('organizations')) return 'Organizations';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('work-items')) return 'Work Items';
    if (path.includes('text-blocks')) return 'Rules';
    if (path.includes('organization-management'))
      return 'Organization Management';
    if (path.includes('settings')) return 'Settings';
    return '';
  };

  return (
    <Header className={styles.header}>
      <Button
        type="default"
        icon={<MenuOutlined />}
        onClick={onOpenDrawer}
        className={styles.burgerBtn}
      />
      <Content
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {currentPath.includes('prompt-generator') && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBackToWorkItems}
              style={{ marginRight: '8px' }}
            />
          )}
          <div className={styles.pageTitle}>{getPageTitle(currentPath)}</div>
        </div>
        <OrganizationDropdown />
        <ProjectsDropdown />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateWorkItem}
        >
          Create Work Item
        </Button>
        <div>
          <UserAvatar />
          <LogoutButton />
        </div>
      </Content>
    </Header>
  );
}
