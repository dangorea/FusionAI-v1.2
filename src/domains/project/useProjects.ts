import type { Key } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectAllProjects } from '../../lib/redux/feature/projects/selectors';
import { selectSelectedOrganizationEntity } from '../../lib/redux/feature/organization/selectors';
import type { ProjectType } from './model/type';
import {
  deleteProjectThunk,
  fetchProjects,
} from '../../lib/redux/feature/projects/thunk';
import {
  NOTIFICATION_DURATION_LONG,
  NOTIFICATION_DURATION_SHORT,
} from '../../utils/notifications';
import { LocalStorageKeys } from '../../utils/localStorageKeys';

const useProjects = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [selectedProjects, setSelectedProjects] = useState<ProjectType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!org?.slug) return;

    dispatch(
      fetchProjects({
        orgSlug: org.slug,
        page: currentPage,
        limit: pageSize,
        searchTerm,
      }),
    )
      .unwrap()
      .then((response) => {
        setTotal(response.totalCount);
      })
      .catch((error) => {
        notification.error({
          message: 'Error Loading Projects',
          description: error.message || 'Failed to load projects.',
          duration: NOTIFICATION_DURATION_LONG,
        });
      });
  }, [currentPage, dispatch, org, pageSize, searchTerm]);

  const selectedProjectsIds = useMemo(
    () => selectedProjects.map((p) => p.id),
    [selectedProjects],
  );

  const handleDeleteProject = async () => {
    try {
      if (!org?.slug) throw new Error('No organization selected');
      if (selectedProjects.length === 0) {
        notification.warning({
          message: 'No Projects Selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        return;
      }

      await Promise.all(
        selectedProjectsIds.map((id) =>
          dispatch(
            deleteProjectThunk({
              orgSlug: org.slug!,
              projectId: id,
            }),
          ).unwrap(),
        ),
      );

      selectedProjects.forEach(({ id }) => {
        localStorage.removeItem(`${id}-${LocalStorageKeys.PROJECT_PATHS}`);
        localStorage.removeItem(`${id}-${LocalStorageKeys.PROJECT_FILE_TREES}`);
      });

      setSelectedProjects([]);

      notification.success({
        message: 'Selected Projects Deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Delete Selected Projects',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleSelectChange = (_: Key[], selectedProjs: ProjectType[]) => {
    setSelectedProjects(selectedProjs);
  };

  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  return {
    selectedProjects,
    handleDeleteProject,
    isModalOpen,
    setIsModalOpen,
    projects,
    handleSelectChange,
    selectedProjectsIds,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handleSearch,
  };
};

export { useProjects };
