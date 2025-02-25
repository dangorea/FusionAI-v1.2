import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useState } from 'react';
// import { useRootContext } from '../../state';
// import { useProject } from '../../Context/ProjectsContext';
// import { LocalStorageKeys } from '../../utils/localStorageKeys';

interface ProjectsDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

function ProjectsDropdown({ value, onChange }: ProjectsDropdownProps) {
  // const { projects, setSelectedProjectId } = useProject();
  // const { setProjectDirectory, setFileTree } = useRootContext();
  const [currentValue, setCurrentValue] = useState<string | undefined>(value);

  // useEffect(() => {
  //   const savedProjectId = localStorage.getItem(
  //     LocalStorageKeys.SELECTED_PROJECT,
  //   );
  //   if (savedProjectId) {
  //     setSelectedProjectId(savedProjectId);
  //     setCurrentValue(savedProjectId);
  //   }
  // }, []);
  //
  // const loadProjectData = useCallback(
  //   (projectId: string) => {
  //     const projectDirectory = localStorage.getItem(
  //       `${projectId}-${LocalStorageKeys.PROJECT_PATHS}`,
  //     );
  //     const fileTree = localStorage.getItem(
  //       `${projectId}-${LocalStorageKeys.PROJECT_FILE_TREES}`,
  //     );
  //
  //     if (projectDirectory) {
  //       setProjectDirectory(projectDirectory);
  //     } else {
  //       setProjectDirectory(null);
  //     }
  //
  //     if (fileTree) {
  //       setFileTree(JSON.parse(fileTree));
  //     } else {
  //       setFileTree(null);
  //     }
  //   },
  //   [setProjectDirectory, setFileTree],
  // );
  //
  // useEffect(() => {
  //   if (value) {
  //     loadProjectData(value);
  //   }
  // }, [value, loadProjectData]);
  //
  // const handleMenuClick = (key: string) => {
  //   setSelectedProjectId(key);
  //   setCurrentValue(key);
  //   localStorage.setItem(LocalStorageKeys.SELECTED_PROJECT, key);
  //   if (onChange) {
  //     onChange(key);
  //   }
  // };
  //
  // const items: MenuProps['items'] = projects.map((project) => ({
  //   label: project.title,
  //   key: project.id,
  // }));
  //
  // const selectedProjectTitle =
  //   currentValue &&
  //   projects.find((project) => project.id === currentValue)?.title;

  return (
    <Dropdown
      menu={
        {
          // items,
          // onClick: ({ key }) => {
          //   handleMenuClick(key);
          // },
        }
      }
      trigger={['click']}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          {/*{selectedProjectTitle || 'Select a Project'}*/}
          Select a Project
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
}

export default ProjectsDropdown;
