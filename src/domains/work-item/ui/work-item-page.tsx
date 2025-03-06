import React, { useEffect, useState } from 'react';
import { Button, notification } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { WorkItemsModal, WorkItemTable } from '../../../components';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  createWorkItemThunk,
  deleteWorkItemThunk,
  loadWorkItemsThunk,
  updateWorkItemThunk,
} from '../../../lib/redux/feature/work-items/thunk';
import { setEditingWorkItem } from '../../../lib/redux/feature/work-items/reducer';
import { selectAllWorkItems } from '../../../lib/redux/feature/work-items/selectors';

import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { WorkItemType } from '../model/types';
import { useNavigate } from 'react-router';
import styles from '../../organization/ui/OrganizationManagement.module.scss';

export function WorkItems() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const allWorkItems = useAppSelector(selectAllWorkItems);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingItemIds, setEditingItemIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedProjectId || !org?.slug) return;

    dispatch(
      loadWorkItemsThunk({
        page: currentPage,
        limit: pageSize,
        searchTerm,
        orgSlug: org.slug,
        projectId: selectedProjectId,
      }),
    )
      .unwrap()
      .then((response) => {
        setTotal(response.totalCount);
        return response;
      })
      .catch((error) => {
        notification.error({
          message: 'Error Loading Work Items',
          description: error.message || 'Failed to load work items.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [
    selectedProjectId,
    currentPage,
    pageSize,
    searchTerm,
    dispatch,
    org?.slug,
  ]);

  const handleDeleteWorkItem = async () => {
    if (selectedRowKeys.length === 0) {
      notification.error({
        message: 'No items selected for deletion',
        duration: NOTIFICATION_DURATION_LONG,
      });
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          dispatch(
            deleteWorkItemThunk({
              orgSlug: org?.slug || '',
              projectId: selectedProjectId || '',
              id: id as string,
            }),
          ),
        ),
      );

      await dispatch(
        loadWorkItemsThunk({
          page: currentPage,
          limit: pageSize,
          searchTerm,
          orgSlug: org?.slug || '',
          projectId: selectedProjectId || '',
        }),
      );

      setSelectedRowKeys([]);
      notification.success({ message: 'Selected Work Items Deleted' });
    } catch (error: any) {
      notification.error({
        message: 'Failed to Delete Work Items',
        description: error.message,
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  };

  const openEditModal = (workItemId?: string) => {
    if (workItemId) {
      setEditingItemIds([workItemId]);
      setModalMode('edit');
      setModalOpen(true);
      return;
    }

    if (selectedRowKeys.length === 0) {
      notification.error({ message: 'No items selected to edit' });
      return;
    }

    setEditingItemIds(selectedRowKeys.map(String));
    setModalMode('edit');
    setModalOpen(true);
  };

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
        // On success
        const createdWorkItem = action.payload;
        notification.success({
          message: 'Work Item Added',
          duration: NOTIFICATION_DURATION_LONG,
        });
        setModalOpen(false);
        setModalMode(null);

        // Optionally set the newly created item as "editing" so you can navigate or show details:
        dispatch(setEditingWorkItem(createdWorkItem.id));

        // Reload data
        dispatch(
          loadWorkItemsThunk({
            page: currentPage,
            limit: pageSize,
            searchTerm,
            orgSlug: org.slug,
            projectId: selectedProjectId || '',
          }),
        );
      } else {
        notification.error({
          message: 'Failed to Add Work Item',
          duration: NOTIFICATION_DURATION_LONG,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Failed to Add Work Item',
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  };

  const handleUpdateWorkItems = async (
    updatedFields: Pick<WorkItemType, 'description'>,
  ) => {
    try {
      if (!selectedProjectId || !org?.slug) return;

      await Promise.all(
        editingItemIds.map((id) =>
          dispatch(
            updateWorkItemThunk({
              orgSlug: org.slug,
              projectId: selectedProjectId,
              workItem: { id, description: updatedFields.description },
            }),
          ),
        ),
      );

      await dispatch(
        loadWorkItemsThunk({
          page: currentPage,
          limit: pageSize,
          searchTerm,
          orgSlug: org.slug,
          projectId: selectedProjectId,
        }),
      );

      notification.success({
        message: `Successfully updated ${editingItemIds.length} Work Item(s)`,
      });

      // Clear everything
      setEditingItemIds([]);
      setModalOpen(false);
      setModalMode(null);
      setSelectedRowKeys([]);
    } catch (error: any) {
      notification.error({
        message: 'Failed to Update Work Items',
        description: error.message,
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  };

  const onSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleRowClick = (record: WorkItemType) => {
    navigate(`/prompt-generator/${record.id}`);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.componentRoot}>
      <div className={styles.buttonContainer}>
        <Button
          icon={<PlusOutlined />}
          type="text"
          onClick={() => {
            setModalMode('create');
            setModalOpen(true);
          }}
        />
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => openEditModal()}
        />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleDeleteWorkItem}
        />
      </div>

      <WorkItemTable
        workItems={allWorkItems}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={onSelectChange}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />

      <WorkItemsModal
        isModalOpen={isModalOpen}
        modalMode={modalMode}
        editingItemIds={editingItemIds}
        allWorkItems={allWorkItems}
        onClose={() => {
          setModalOpen(false);
          setModalMode(null);
          setEditingItemIds([]);
        }}
        onCreate={handleAddWorkItem}
        onEdit={handleUpdateWorkItems}
      />
    </div>
  );
}
