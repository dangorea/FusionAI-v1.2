import type { Key } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../lib/redux/feature/organization/selectors';
import type { RootState } from '../../lib/redux/store';
import { organizationManagementAdapter } from '../../lib/redux/feature/organization-management/adapter';
import type { OrganizationManagementDataType } from '../../lib/redux/feature/organization-management/types';
import { fetchOrganizationManagements } from '../../lib/redux/feature/organization-management/thunk';
import {
  NOTIFICATION_DURATION_LONG,
  NOTIFICATION_DURATION_SHORT,
} from '../../utils/notifications';
import { removeOrganizationMember } from '../../api/organization-management';
import { deleteOrganizationManagement } from '../../lib/redux/feature/organization-management/reducer';

const useOrganizationManagement = () => {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const organizationManagements = useAppSelector((state: RootState) =>
    organizationManagementAdapter
      .getSelectors()
      .selectAll(state.organizationManagement),
  );
  const [selectedManagements, setSelectedManagements] = useState<
    (OrganizationManagementDataType & { id: string })[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const managements = useMemo(() => {
    return organizationManagements.map((el) => ({ ...el, id: el.email }));
  }, [organizationManagements]);

  useEffect(() => {
    if (!org?.slug) return;
    dispatch(
      fetchOrganizationManagements({
        orgSlug: org.slug,
        page: currentPage,
        limit: pageSize,
        searchTerm,
      }),
    )
      .unwrap()
      .then((response) => {
        setTotal(response.length);
      })
      .catch((error) => {
        notification.error({
          message: 'Error Loading Organization Members',
          description: error.message || 'Failed to load organization members.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [currentPage, dispatch, org, pageSize, searchTerm]);

  const handleDeleteOrganizationManagement = async () => {
    try {
      if (!org?.slug) throw new Error('Organization slug not found');
      selectedManagements.map(async (management) => {
        await removeOrganizationMember(org.slug, { email: management.email });
        dispatch(deleteOrganizationManagement(management.email));
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

  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleSelectChange = useCallback(
    (_: Key[], selectedOrgs: OrganizationManagementDataType[]) => {
      setSelectedManagements(selectedOrgs.map((o) => ({ ...o, id: o.email })));
    },
    [],
  );

  const selectedOrgIds = useMemo(
    () => selectedManagements.map((el) => el.id),
    [selectedManagements],
  );

  return {
    selectedManagements,
    handleDeleteOrganizationManagement,
    isModalOpen,
    setIsModalOpen,
    managements,
    selectedOrgIds,
    handleSelectChange,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handleSearch,
  };
};

export { useOrganizationManagement };
