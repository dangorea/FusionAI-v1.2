import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DrawerRenderer } from '../../../components';
import styles from './main-layout.module.scss';
import Header from './header';
import type { WorkItemType } from '../../../domains/work-item/model/types';
import { WorkItemsModal } from '../../../domains/work-item/components/modal';
import { useAppDispatch } from '../../../lib/redux/hook';
import { setSelectedWorkItem } from '../../../lib/redux/feature/work-items/reducer';

const { Content } = Layout;

export default function MainLayout() {
  const dispatch = useAppDispatch();
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
    dispatch(setSelectedWorkItem(null));
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
