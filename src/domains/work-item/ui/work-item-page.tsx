import type { Key } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import { WorkItemModalForm, WorkItemTable } from '../components';
import { NOTIFICATION_DURATION_LONG } from '../../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import {
  deleteWorkItemThunk,
  loadWorkItemsThunk,
} from '../../../lib/redux/feature/work-items/thunk';
import { selectAllWorkItems } from '../../../lib/redux/feature/work-items/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { LayoutContainer, CommonToolbar } from '../../../components';
import type { WorkItemType } from '../model/types';

export function WorkItems() {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const allWorkItems = useAppSelector(selectAllWorkItems);
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [selectedWorkItems, setSelectedWorkItems] = useState<WorkItemType[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      })
      .catch((error) => {
        notification.error({
          message: 'Error Loading Work Items',
          description: error.message || 'Failed to load work items.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [selectedProjectId, currentPage, pageSize, searchTerm, dispatch, org]);

  const selectedWorkItemsIds = useMemo(() => {
    return selectedWorkItems.map((workItem) => workItem.id);
  }, [selectedWorkItems]);

  const handleSelectChange = useCallback(
    (_: Key[], workItems: WorkItemType[]) => {
      setSelectedWorkItems(workItems);
    },
    [],
  );

  const handleDeleteWorkItem = useCallback(async () => {
    if (selectedWorkItems.length === 0) {
      notification.error({
        message: 'No items selected for deletion',
        duration: NOTIFICATION_DURATION_LONG,
      });
      return;
    }

    try {
      await Promise.all(
        selectedWorkItemsIds.map((id) =>
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

      await dispatch(
        loadWorkItemsThunk({
          page: currentPage,
          limit: pageSize,
          orgSlug: org?.slug || '',
          projectId: selectedProjectId || '',
        }),
      );

      setSelectedWorkItems([]);
      notification.success({ message: 'Selected Work Items Deleted' });
    } catch (error: any) {
      notification.error({
        message: 'Failed to Delete Work Items',
        description: error.message,
        duration: NOTIFICATION_DURATION_LONG,
      });
    }
  }, [
    currentPage,
    dispatch,
    org,
    pageSize,
    searchTerm,
    selectedProjectId,
    selectedWorkItems,
    selectedWorkItemsIds,
  ]);

  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  return (
    <LayoutContainer>
      <CommonToolbar
        title="Work Items Submission Form"
        selectedItems={selectedWorkItems}
        onDelete={handleDeleteWorkItem}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      >
        <WorkItemModalForm
          selectedWorkItems={selectedWorkItems}
          setIsModalOpen={setIsModalOpen}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </CommonToolbar>

      <WorkItemTable
        workItems={allWorkItems}
        selectedRowKeys={selectedWorkItemsIds}
        onSelectChange={handleSelectChange}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </LayoutContainer>
  );
}
