import React, { useEffect, useState } from 'react';
import { Button, notification, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { WorkItemsModal, WorkItemTable } from '../../../components';
import { DrawerOption } from '../../../constants/drawer-options';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  createWorkItemThunk,
  deleteWorkItemThunk,
  loadWorkItemsThunk,
} from '../../../lib/redux/feature/work-items/thunk';
import { setEditingWorkItem } from '../../../lib/redux/feature/work-items/reducer';
import { selectAllWorkItems } from '../../../lib/redux/feature/work-items/selectors';

import {
  selectAllProjects,
  selectSelectedProjectId,
} from '../../../lib/redux/feature/projects/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';

export function WorkItems() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const allWorkItems = useAppSelector(selectAllWorkItems);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
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
        orgSlug: org?.slug,
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
    if (selectedRowKeys.length > 0) {
      selectedRowKeys.map(async (id) => {
        if (!org?.slug) return;
        await dispatch(
          deleteWorkItemThunk({
            orgSlug: org.slug,
            projectId: selectedProjectId || '',
            id: id as string,
          }),
        );
      });
      setSelectedRowKeys([]);
      if (!org?.slug) return;
      dispatch(
        loadWorkItemsThunk({
          page: currentPage,
          limit: pageSize,
          searchTerm,
          orgSlug: org.slug,
          projectId: selectedProjectId || '',
        }),
      );
      notification.success({ message: 'Selected Work Items Deleted' });
    } else {
      notification.error({
        message: 'No items selected for deletion',
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  };

  const handleEditWorkItem = (workItemId?: string) => {
    const idToEdit =
      workItemId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null);

    if (idToEdit) {
      const selectedWorkItem = allWorkItems.find((w) => w.id === idToEdit);
      if (selectedWorkItem) {
        dispatch(setEditingWorkItem(selectedWorkItem.id));
        navigate(DrawerOption.PromptGenerator);
      }
    } else {
      alert('Select exactly one item to edit');
    }
  };

  const handleAddWorkItem = async (newItem: {
    description: string;
    projectId: string;
  }) => {
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
        notification.success({
          message: 'Work Item Added',
          duration: NOTIFICATION_DURATION_LONG,
        });
        setModalOpen(false);
        dispatch(setEditingWorkItem(createdWorkItem.id));

        dispatch(
          loadWorkItemsThunk({
            page: currentPage,
            limit: pageSize,
            searchTerm,
            orgSlug: org?.slug,
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

  const onSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id],
    );
  };

  const handleRowClick = (record: any) => {
    handleEditWorkItem(record.id);
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
    <>
      <Space style={{ marginBottom: 16, float: 'right' }}>
        <Button
          icon={<PlusOutlined />}
          type="text"
          onClick={() => setModalOpen(true)}
        />
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditWorkItem()}
          disabled={selectedRowKeys.length !== 1}
        />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleDeleteWorkItem}
          disabled={selectedRowKeys.length === 0}
        />
      </Space>

      <WorkItemTable
        projects={projects}
        workItems={allWorkItems}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={onSelectChange}
        expandedRowKeys={expandedRowKeys}
        toggleExpandRow={toggleExpandRow}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />

      <WorkItemsModal
        isModalOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddWorkItem}
      />
    </>
  );
}
