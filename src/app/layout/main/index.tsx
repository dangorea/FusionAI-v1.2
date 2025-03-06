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
    <Layout style={{ height: '100%' }}>
      <Header
        currentPath={location.pathname}
        onOpenDrawer={setDrawerOpen.bind(null, true)}
        onBackToWorkItems={handleBackToWorkItems}
        onCreateWorkItem={setModalOpen.bind(null, true)}
      />

      <DrawerRenderer
        open={drawerOpen}
        onClose={setDrawerOpen.bind(null, false)}
      />

      <Content className={styles.content}>
        <Outlet />
      </Content>

      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={setModalOpen.bind(null, false)}
        onCreate={handleAddWorkItem}
        modalMode="create"
        onEdit={function (data: { description: string }): void {
          throw new Error('Function not implemented.');
        }}
      />
    </Layout>
  );
}
