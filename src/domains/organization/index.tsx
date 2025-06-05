import type { Key } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import {
  NOTIFICATION_DURATION_LONG,
  NOTIFICATION_DURATION_SHORT,
} from '../../utils/notifications';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectAllOrganizations } from '../../lib/redux/feature/organization/selectors';
import { OrganizationBlockTable, OrganizationModalForm } from './components';
import { CommonToolbar, LayoutContainer } from '../../components';
import {
  deleteOrganizationThunk,
  fetchOrganizationBlocks,
} from '../../lib/redux/feature/organization/thunk';
import type { OrganizationType } from './model/types';

export function Organization() {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectAllOrganizations);

  const [selectedOrganizations, setSelectedOrganizations] = useState<
    OrganizationType[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormKey, setModalFormKey] = useState(0);

  useEffect(() => {
    if (!isModalOpen) {
      setModalFormKey((key) => key + 1);
    }
  }, [isModalOpen]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(
      fetchOrganizationBlocks({
        page: currentPage,
        limit: pageSize,
        searchTerm,
      }),
    )
      .unwrap()
      .then((response) => setTotal(response.totalCount))
      .catch((error) => {
        notification.error({
          message: 'Error Loading Organizations',
          description: error.message || 'Failed to load organizations.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [currentPage, dispatch, pageSize, searchTerm]);

  const selectedOrgIds = useMemo(
    () => selectedOrganizations.map((org) => org.id),
    [selectedOrganizations],
  );

  const handleDeleteOrganizationBlock = useCallback(async () => {
    try {
      await Promise.all(
        selectedOrganizations.map((org) =>
          dispatch(deleteOrganizationThunk({ org })).unwrap(),
        ),
      );
      notification.success({
        message: 'Selected Organization Blocks Deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      setSelectedOrganizations([]);
    } catch {
      notification.error({
        message: 'Failed to Delete Selected Organization Blocks',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  }, [dispatch, selectedOrganizations]);

  const handleSelectChange = useCallback(
    (_: Key[], selectedOrgs: OrganizationType[]) => {
      setSelectedOrganizations(selectedOrgs);
    },
    [],
  );

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
        title="Organization Submission Form"
        selectedItems={selectedOrganizations}
        onDelete={handleDeleteOrganizationBlock}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      >
        <OrganizationModalForm
          key={modalFormKey}
          selectedOrganizations={selectedOrganizations}
          setIsModalOpen={setIsModalOpen}
        />
      </CommonToolbar>

      <OrganizationBlockTable
        organizationBlocks={organizations}
        selectedRowKeys={selectedOrgIds}
        onSelectChange={handleSelectChange}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        setOpen={setIsModalOpen}
      />
    </LayoutContainer>
  );
}
