import React, { useEffect, useState } from 'react';
import { Layout, Modal } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DrawerRenderer, OnboardingWizard } from '../../../components';
import styles from './main-layout.module.scss';
import Header from './header';
import { useAppDispatch } from '../../../lib/redux/hook';
import { setSelectedWorkItem } from '../../../lib/redux/feature/work-items/reducer';
import { fetchUser } from '../../../lib/redux/feature/user/thunk';
import { WorkItemModalForm } from '../../../domains/work-item/components';

const { Content } = Layout;

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/work-items', { replace: true });
    }
  }, [location, navigate]);

  const handleBackToWorkItems = () => {
    navigate('/work-items');
    dispatch(setSelectedWorkItem(null));
  };

  return (
    <Layout className={styles.mainLayout}>
      <Header
        currentPath={location.pathname}
        onOpenDrawer={setDrawerOpen.bind(null, true)}
        onBackToWorkItems={handleBackToWorkItems}
        onCreateWorkItem={setIsModalOpen.bind(null, true)}
      />

      <DrawerRenderer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Content className={styles.content}>
        <Outlet />
      </Content>

      <OnboardingWizard />

      <Modal
        title="Work Items Submission Form"
        centered
        open={isModalOpen}
        onCancel={setIsModalOpen.bind(null, false)}
        width={1000}
        footer={null}
        maskClosable={false}
      >
        <WorkItemModalForm
          selectedWorkItems={null}
          setIsModalOpen={setIsModalOpen}
          currentPage={0}
          pageSize={0}
        />
      </Modal>
    </Layout>
  );
}
