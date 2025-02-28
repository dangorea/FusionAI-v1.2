import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import {
  OrganizationManagementModal,
  OrganizationManagementTable,
} from '../../../components';
import styles from './OrganizationManagement.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';

import { OrganizationManagementDataType } from '../../../lib/redux/feature/user/types';
import {
  addOrganizationManagement,
  deleteOrganizationManagement,
  editOrganizationManagement,
} from '../../../lib/redux/feature/user/reducer';
import { fetchOrganizationManagements } from '../../../lib/redux/feature/user/thunk';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectCurrentOrganizationId } from '../../../lib/redux/feature/organization/selectors';
import { userAdapter } from '../../../lib/redux/feature/user/adapter';
import { RootState } from '../../../lib/redux/store';

import {
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from '../../../api/organizationManagment';

export function OrganizationManagement() {
  const dispatch = useAppDispatch();
  const orgId = useAppSelector(selectCurrentOrganizationId);

  const organizationManagements = useAppSelector((state: RootState) =>
    userAdapter.getSelectors().selectAll(state.user),
  );

  const [selectedManagements, setSelectedManagements] = useState<
    OrganizationManagementDataType[]
  >([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!orgId) {
      notification.error({
        message: 'Failed to fetch organization slug',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      return;
    }
    dispatch(fetchOrganizationManagements(orgId));
  }, [orgId, dispatch]);

  const handleAddOrganizationManagement = async (
    newManagement: OrganizationManagementDataType,
  ) => {
    try {
      if (!orgId) throw new Error('Organization slug not found');
      const createdManagement = await addOrganizationMember(
        orgId,
        newManagement,
      );
      dispatch(addOrganizationManagement(createdManagement));
      notification.success({
        message: 'Member Added',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Add Member',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleEditOrganizationManagement = async (
    updatedManagement: OrganizationManagementDataType,
  ) => {
    try {
      if (!orgId) throw new Error('Organization slug not found');
      const response = await updateOrganizationMemberRole(
        orgId,
        updatedManagement,
      );
      dispatch(editOrganizationManagement(response));
      notification.success({
        message: 'Member Role Updated',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Update Member Role',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleDeleteOrganizationManagement = async () => {
    try {
      if (!orgId) throw new Error('Organization slug not found');
      for (const management of selectedManagements) {
        await removeOrganizationMember(orgId, { userId: management.userId });
        dispatch(deleteOrganizationManagement(management.userId));
      }
      notification.success({
        message: 'Selected Members Removed',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      setSelectedManagements([]);
    } catch (error) {
      notification.error({
        message: 'Failed to Remove Selected Members',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleSelectChange = (selectedIds: React.Key[]) => {
    const selectedItems = organizationManagements.filter((m) =>
      selectedIds.includes(m.userId),
    );
    setSelectedManagements(selectedItems);
  };

  return (
    <div className={styles.componentRoot}>
      <OrganizationManagementModal
        selectedManagements={selectedManagements}
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddOrganizationManagement}
        onEdit={handleEditOrganizationManagement}
        onDelete={handleDeleteOrganizationManagement}
      />
      <OrganizationManagementTable
        organizationManagements={organizationManagements}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
