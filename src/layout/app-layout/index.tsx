import { Button, Layout } from 'antd';
import React, { useState } from 'react';
// import {
//   OrganizationBlocks,
//   OrganizationManagement,
//   Projects,
//   Settings,
//   TextBlocks,
//   WorkItems,
// } from '../../pages';
import {
  ArrowLeftOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { DrawerOption } from '../../components/drawer/AppDrawer/consts';
import styles from './AppLayout.module.scss';
import { OrganizationDropdown } from '../../components/OrganizationBlock/OrganizationDropDown';
import ProjectsDropdown from '../../components/ProjectsDropdown';
import LoginButton from '../../components/Auth0Buttons/LoginButton';
import LogoutButton from '../../components/Auth0Buttons/LogoutButton';
import { AppDrawer } from '../../components/drawer/AppDrawer';
import { WorkItemsModal } from '../../components/WorkItems/WorkItemModal';

const { Header, Content } = Layout;

type PageParams = {
  id?: string;
  name?: string;
};

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<DrawerOption>(
    DrawerOption.Organizations,
  );
  const [pageParams, setPageParams] = useState<PageParams>({});
  const [isModalOpen, setModalOpen] = useState(false);
  // const { createWorkItem, setEditingWorkItem } = useWorkItemContext();

  const handleNavigate = (page: DrawerOption, params?: PageParams) => {
    setSelectedTab(page);
    setPageParams(params || {});
  };

  const handleAddWorkItem = async (newItem: {
    description: string;
    projectId: string;
  }) => {
    try {
      // const createdWorkItem = await createWorkItem(newItem);
      setModalOpen(false);
      // setEditingWorkItem(createdWorkItem);
      handleNavigate(DrawerOption.PromptGenerator);
    } catch (error) {
      console.error('Failed to add work item:', error);
    }
  };

  // const TabContentMap: Record<DrawerOption, React.FC<any>> = {
  //   [DrawerOption.OrganizationManagment]: OrganizationManagement,
  //   [DrawerOption.TextBlocks]: TextBlocks,
  //   [DrawerOption.Settings]: Settings,
  //   [DrawerOption.Projects]: Projects,
  //   [DrawerOption.WorkItems]: WorkItems,
  //   [DrawerOption.Organizations]: OrganizationBlocks,
  //   [DrawerOption.PromptGenerator]: () => (
  //     <TabsLayout
  //       activeTab={DrawerOption.PromptGenerator}
  //       onTabChange={handleNavigate}
  //     />
  //   ),
  //   [DrawerOption.ShellExecutor]: () => (
  //     <TabsLayout
  //       activeTab={DrawerOption.ShellExecutor}
  //       onTabChange={handleNavigate}
  //     />
  //   ),
  //   [DrawerOption.GPTIntegrator]: () => (
  //     <TabsLayout
  //       activeTab={DrawerOption.GPTIntegrator}
  //       onTabChange={handleNavigate}
  //     />
  //   ),
  // };
  //
  // const renderTabContent = useMemo(() => {
  //   const Component = TabContentMap[selectedTab];
  //   return Component ? (
  //     <Component {...pageParams} onNavigate={handleNavigate} />
  //   ) : (
  //     <div>Page not found</div>
  //   );
  // }, [selectedTab, pageParams]);

  const handleBackToWorkItems = () => {
    setSelectedTab(DrawerOption.WorkItems);
    setPageParams({});
  };

  return (
    <Layout>
      <Header className={styles.header}>
        <Button
          type="default"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
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
            {selectedTab === DrawerOption.PromptGenerator && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToWorkItems}
                style={{ marginRight: '8px' }}
              />
            )}
            <div className={styles.pageTitle}>{selectedTab}</div>
          </div>
          <OrganizationDropdown />
          <ProjectsDropdown />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Create Work Item
          </Button>
          <div>
            <LoginButton />
            <LogoutButton />
          </div>
        </Content>
      </Header>
      <AppDrawer
        open={drawerOpen}
        onPageSelected={(page) => {
          setSelectedTab(page);
          setPageParams({});
          setDrawerOpen(false);
        }}
        onClose={() => setDrawerOpen(false)}
      />
      <Content className={styles.content}>
        {/* <div className={styles.styledBox}>{renderTabContent}</div> */}
      </Content>
      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddWorkItem}
      />
    </Layout>
  );
}

export default AppLayout;
