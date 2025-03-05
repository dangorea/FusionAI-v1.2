import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { OrganizationBlockTable, OrganizationModal } from '../../../components';
import styles from './OrganizationBlocks.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';
import {
  addOrganizationBlock,
  deleteOrganizationBlock,
  editOrganizationBlock,
} from '../../../lib/redux/feature/organization/reducer';
import { fetchOrganizationBlocks } from '../../../lib/redux/feature/organization/thunk';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectAllOrganizations } from '../../../lib/redux/feature/organization/selectors';
import {
  createOrganizationBlock,
  deleteOrganizationBlock as apiDeleteOrganizationBlock,
  updateOrganizationBlock,
} from '../../../api/organizationBlocks';
import { OrganizationType } from '../model/types';

export function Organization() {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectAllOrganizations);
  const [selectedBlocks, setSelectedBlocks] = useState<OrganizationType[]>([]);

  useEffect(() => {
    dispatch(fetchOrganizationBlocks());
  }, [dispatch]);

  const handleAddOrganizationBlock = async (
    newBlock: Omit<OrganizationType, '_id'>,
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
    updatedBlock: OrganizationType,
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
      selectedBlocks.map(async (block) => {
        await apiDeleteOrganizationBlock(block.slug);
        dispatch(deleteOrganizationBlock(block.slug));
      });

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
    const selectedItems = organizations.filter((block) =>
      selectedIds.includes(block._id!),
    );
    setSelectedBlocks(selectedItems);
  };

  return (
    <div className={styles.componentRoot}>
      <OrganizationModal
        selectedBlocks={selectedBlocks}
        onAdd={handleAddOrganizationBlock}
        onEdit={handleEditOrganizationBlock}
        onDelete={handleDeleteOrganizationBlock}
      />
      <OrganizationBlockTable
        organizationBlocks={organizations}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
