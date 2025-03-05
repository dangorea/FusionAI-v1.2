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
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { userAdapter } from '../../../lib/redux/feature/user/adapter';
import { RootState } from '../../../lib/redux/store';
import {
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from '../../../api/organizationManagment';

export function OrganizationManagement() {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const organizationManagements = useAppSelector((state: RootState) =>
    userAdapter.getSelectors().selectAll(state.user),
  );
  const [selectedManagements, setSelectedManagements] = useState<
    OrganizationManagementDataType[]
  >([]);

  useEffect(() => {
    if (!org?.slug) {
      notification.error({
        message: 'Failed to fetch organization slug',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      return;
    }
    dispatch(fetchOrganizationManagements(org.slug));
  }, [org?.slug, dispatch]);

  const handleAddOrganizationManagement = async (
    newManagement: OrganizationManagementDataType,
  ) => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      const createdManagement = await addOrganizationMember(
        org.slug,
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
      if (!org?.slug) throw new Error('Organization slug not found');
      const response = await updateOrganizationMemberRole(
        org.slug,
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
      if (!org?.slug) throw new Error('Organization slug not found');
      selectedManagements.map(async (management) => {
        await removeOrganizationMember(org.slug, { userId: management.userId });
        dispatch(deleteOrganizationManagement(management.userId));
      });
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
