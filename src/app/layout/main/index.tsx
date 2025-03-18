import { useEffect, useState } from 'react';
import { Layout, notification } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { DrawerRenderer } from '../../../components';
import styles from './main-layout.module.scss';
import Header from './header';
import type { WorkItemType } from '../../../domains/work-item/model/types';
import { WorkItemsModal } from '../../../domains/work-item/components';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { setSelectedWorkItem } from '../../../lib/redux/feature/work-items/reducer';
import { createWorkItemThunk } from '../../../lib/redux/feature/work-items/thunk';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';

const { Content } = Layout;

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
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
    try {
      if (!org?.slug) return;
      const action = await dispatch(
        createWorkItemThunk({
          orgSlug: org.slug,
          projectId: selectedProjectId || '',
          description: newItem.description,
        }),
      );

      if (createWorkItemThunk.fulfilled.match(action)) {
        const createdWorkItem = action.payload;

        dispatch(setSelectedWorkItem(createdWorkItem.id));
        navigate(`/prompt-generator/${createdWorkItem.id}`);
      }

      setModalOpen(false);
    } catch (error) {
      notification.error({
        message: 'Failed to Add Work Item',
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  };

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
        onCreateWorkItem={setModalOpen.bind(null, true)}
      />

      <DrawerRenderer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Content className={styles.content}>
        <Outlet />
      </Content>

      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={setModalOpen.bind(null, false)}
        onCreate={handleAddWorkItem}
        modalMode="create"
        onEdit={() => {
          throw new Error('Function not implemented.');
        }}
      />
    </Layout>
  );
}
