import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { LocalStorageKeys } from '../../../../utils/localStorageKeys';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectAllProjects,
  selectSelectedProjectId,
} from '../../../../lib/redux/feature/projects/selectors';
import { setSelectedProjectId } from '../../../../lib/redux/feature/projects/reducer';
import styles from './style.module.scss';

function ProjectsDropdown() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const selectedProjectId = useAppSelector(selectSelectedProjectId);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem(
        LocalStorageKeys.SELECTED_PROJECT,
        selectedProjectId,
      );
    } else {
      localStorage.removeItem(LocalStorageKeys.SELECTED_PROJECT);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (projects.length) {
      dispatch(setSelectedProjectId(projects[0].id));
    } else {
      dispatch(setSelectedProjectId(null));
    }
  }, [dispatch, projects]);

  const handleMenuClick = (key: string) => {
    dispatch(setSelectedProjectId(key));
    navigate('/work-items');
  };

  const items: MenuProps['items'] = useMemo(
    () =>
      projects.map((project) => ({
        label: project.name,
        key: project.id,
      })),
    [projects],
  );

  const selectedProjectName = useMemo(
    () =>
      selectedProjectId &&
      projects.find((project) => project.id === selectedProjectId)?.name,
    [projects, selectedProjectId],
  );

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => {
          handleMenuClick(key);
        },
      }}
      trigger={['click']}
    >
      <div className={styles['dropdown-container']}>
        <div className={styles['dropdown-selected']}>
          {selectedProjectName || 'Select a Project'}
        </div>
        <DownOutlined style={{ fontSize: 10, marginTop: 4, marginLeft: 2 }} />
      </div>
    </Dropdown>
  );
}

export { ProjectsDropdown };
