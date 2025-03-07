import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { LocalStorageKeys } from '../../../../utils/localStorageKeys';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectAllProjects } from '../../../../lib/redux/feature/projects/selectors';
import { setSelectedProjectId } from '../../../../lib/redux/feature/projects/reducer';
import { fetchProjects } from '../../../../lib/redux/feature/projects/thunk';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';

interface ProjectsDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ProjectsDropdown({ value, onChange }: ProjectsDropdownProps) {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const [currentValue, setCurrentValue] = useState<string | undefined>(value);

  useEffect(() => {
    if (org) {
      dispatch(fetchProjects(org.slug));
    }

    const savedProjectId = localStorage.getItem(
      LocalStorageKeys.SELECTED_PROJECT,
    );
    if (savedProjectId) {
      dispatch(setSelectedProjectId(savedProjectId));
      setCurrentValue(savedProjectId);
    }
  }, [org, dispatch]);

  const loadProjectData = useCallback((projectId: string) => {
    const projectDirectory = localStorage.getItem(
      `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
    );
    const fileTree = localStorage.getItem(
      `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
    );

    if (projectDirectory) {
      // setProjectDirectory(projectDirectory);
    } else {
      // setProjectDirectory(null);
    }

    if (fileTree) {
      // setFileTree(JSON.parse(fileTree));
    } else {
      // setFileTree(null);
    }
  }, []);

  useEffect(() => {
    if (value) {
      loadProjectData(value);
    }
  }, [value, loadProjectData]);

  const handleMenuClick = (key: string) => {
    dispatch(setSelectedProjectId(key));
    setCurrentValue(key);
    localStorage.setItem(LocalStorageKeys.SELECTED_PROJECT, key);
    if (onChange) {
      onChange(key);
    }
  };

  const items: MenuProps['items'] = projects.map((project) => ({
    label: project.title,
    key: project.id,
  }));

  const selectedProjectTitle =
    currentValue &&
    projects.find((project) => project.id === currentValue)?.title;

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
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          {selectedProjectTitle || 'Select a Project'}
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
}
