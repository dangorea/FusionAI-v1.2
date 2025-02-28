import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import {
  OrganizationBlockModal,
  OrganizationBlockTable,
} from '../../../components';
import styles from './OrganizationBlocks.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';

import {
  addOrganizationBlock,
  deleteOrganizationBlock,
  editOrganizationBlock,
} from '../../../lib/redux/feature/organization/reducer';
import { fetchOrganizationBlocks } from '../../../lib/redux/feature/organization/thunk';
import { OrganizationBlockDataType } from '../../../lib/redux/feature/organization/types';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectAllOrganizations } from '../../../lib/redux/feature/organization/selectors';

import {
  createOrganizationBlock,
  deleteOrganizationBlock as apiDeleteOrganizationBlock,
  updateOrganizationBlock,
} from '../../../api/organizationBlocks';

export function OrganizationBlocks() {
  const dispatch = useAppDispatch();
  const organizationBlocks = useAppSelector(selectAllOrganizations);

  const [selectedBlocks, setSelectedBlocks] = useState<
    OrganizationBlockDataType[]
  >([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOrganizationBlocks());
  }, [dispatch]);

  const handleAddOrganizationBlock = async (
    newBlock: Omit<OrganizationBlockDataType, '_id'>,
  ) => {
    try {
      const createdBlock = await createOrganizationBlock(newBlock);
      dispatch(addOrganizationBlock(createdBlock));
      notification.success({
        message: 'Organization Block Added',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Add Organization Block',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleEditOrganizationBlock = async (
    updatedBlock: OrganizationBlockDataType,
    previousSlug: string,
  ) => {
    try {
      const response = await updateOrganizationBlock(
        updatedBlock,
        previousSlug,
      );

      dispatch(editOrganizationBlock(response));
      notification.success({
        message: 'Organization Block Updated',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      console.error('Failed to update organization block:', error);
      notification.error({
        message: 'Failed to Update Organization Block',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleDeleteOrganizationBlock = async () => {
    try {
      for (const block of selectedBlocks) {
        await apiDeleteOrganizationBlock(block.slug);
        dispatch(deleteOrganizationBlock(block.slug));
      }
      notification.success({
        message: 'Selected Organization Blocks Deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      setSelectedBlocks([]);
    } catch (error) {
      notification.error({
        message: 'Failed to Delete Selected Organization Blocks',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleSelectChange = (selectedIds: React.Key[]) => {
    const selectedItems = organizationBlocks.filter((block) =>
      selectedIds.includes(block._id!),
    );
    setSelectedBlocks(selectedItems);
  };

  return (
    <div className={styles.componentRoot}>
      <OrganizationBlockModal
        selectedBlocks={selectedBlocks}
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddOrganizationBlock}
        onEdit={handleEditOrganizationBlock}
        onDelete={handleDeleteOrganizationBlock}
      />
      <OrganizationBlockTable
        organizationBlocks={organizationBlocks}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
