import React, { useState } from 'react';
import { notification } from 'antd';
import styles from './organization-management.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';
import type { OrganizationManagementDataType } from '../../../lib/redux/feature/organization-management/types';
import {
  addOrganizationManagement,
  deleteOrganizationManagement,
  editOrganizationManagement,
} from '../../../lib/redux/feature/organization-management/reducer';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { organizationManagementAdapter } from '../../../lib/redux/feature/organization-management/adapter';
import type { RootState } from '../../../lib/redux/store';
import {
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from '../../../api/organization-management';
import {
  OrganizationManagementModal,
  OrganizationManagementTable,
} from '../components';

export function OrganizationManagement() {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const organizationManagements = useAppSelector((state: RootState) =>
    organizationManagementAdapter
      .getSelectors()
      .selectAll(state.organizationManagement),
  );
  const [selectedManagements, setSelectedManagements] = useState<
    OrganizationManagementDataType[]
  >([]);

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
