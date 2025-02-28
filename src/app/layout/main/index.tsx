import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DrawerRenderer } from '../../../components/drawer';
import styles from './main-layout.module.scss';
import Header from './Header';
import { WorkItemsModal } from '../../../components';

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

  const handleAddWorkItem = async (newItem: {
    description: string;
    projectId: string;
  }) => {
    navigate('/prompt-generator');
  };

  const handleBackToWorkItems = () => {
    navigate('/work-items');
  };

  return (
    <Layout style={{ height: '100%' }}>
      <Header
        currentPath={location.pathname}
        onOpenDrawer={() => setDrawerOpen(true)}
        onBackToWorkItems={handleBackToWorkItems}
        onCreateWorkItem={() => setModalOpen(true)}
      />

      <DrawerRenderer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Content className={styles.content}>
        <Outlet />
      </Content>

      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddWorkItem}
      />
    </Layout>
  );
}
