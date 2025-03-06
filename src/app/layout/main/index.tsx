import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DrawerRenderer } from '../../../components/drawer';
import styles from './main-layout.module.scss';
import Header from './header';
import { WorkItemsModal } from '../../../components';
import { WorkItemType } from '../../../domains/work-item/model/types';

const { Content } = Layout;

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/organizations', { replace: true });
    }
  }, [location, navigate]);

  const handleAddWorkItem = async (
    newItem: Pick<WorkItemType, 'description'>,
  ) => {
    navigate('/prompt-generator');
  };

  const handleBackToWorkItems = () => {
    navigate('/work-items');
  };

  return (
    <Layout className={styles.mainLayout}>
      <Header
        currentPath={location.pathname}
        onOpenDrawer={() => setDrawerOpen(true)}
        onBackToWorkItems={handleBackToWorkItems}
        onCreateWorkItem={() => setModalOpen(true)}
      />

      <DrawerRenderer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/*
        We remove "height: 100%" and let the layout expand naturally.
        We also remove any "overflow: auto" or "overflow: scroll".
        If child components need scroll,
        they should have an internal <div style={{overflow: 'auto'}}>
        or a table with max-height, etc.
      */}
      <Content className={styles.content}>
        <Outlet />
      </Content>

      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleAddWorkItem}
        modalMode="create"
        onEdit={() => {
          throw new Error('Function not implemented.');
        }}
      />
    </Layout>
  );
}
