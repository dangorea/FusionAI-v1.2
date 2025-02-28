import React, { useState } from 'react';
import { notification } from 'antd';
import { ProjectModal, ProjectTable } from '../../../components';
import styles from './Projects.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectCurrentOrganizationId } from '../../../lib/redux/feature/organization/selectors';
import { selectAllProjects } from '../../../lib/redux/feature/projects/selectors';
import {
  addProject,
  deleteProject,
  editProject,
} from '../../../lib/redux/feature/projects/reducer';
import { ProjectDataType } from '../../../lib/redux/feature/projects/types';

import {
  createProject,
  deleteProject as apiDeleteProject,
  updateProject,
} from '../../../api/projects';

export function Projects() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const orgId = useAppSelector(selectCurrentOrganizationId);

  const [selectedProjects, setSelectedProjects] = useState<ProjectDataType[]>(
    [],
  );
  const [isModalOpen] = useState(false);

  const handleAddProject = async (newProject: {
    id?: string | undefined;
    title: string;
    details: string;
  }) => {
    try {
      if (!orgId) throw new Error('No organization selected');
      const createdProject = await createProject(orgId, newProject);
      dispatch(addProject(createdProject));
      notification.success({
        message: 'Project Added',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Add Project',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleEditProject = async (updatedProject: {
    id?: string | undefined;
    title: string;
    details: string;
  }) => {
    try {
      if (!orgId) throw new Error('No organization selected');
      if (!updatedProject.id) {
        console.error('Project ID is missing for update.', updatedProject);
        throw new Error('Project ID is missing for update.');
      }

      const response = await updateProject(orgId, updatedProject);
      dispatch(editProject(response));
      notification.success({
        message: 'Project Updated',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    } catch (error) {
      console.error('Failed to update project:', error);
      notification.error({
        message: 'Failed to Update Project',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!orgId) throw new Error('No organization selected');
      selectedProjects.map(async (project) => {
        await apiDeleteProject(orgId, project.id);
        dispatch(deleteProject(project.id));
      });

      notification.success({
        message: 'Selected Projects Deleted',
        duration: NOTIFICATION_DURATION_SHORT,
      });
      setSelectedProjects([]);
    } catch (error) {
      notification.error({
        message: 'Failed to Delete Selected Projects',
        duration: NOTIFICATION_DURATION_SHORT,
      });
    }
  };

  const handleSelectChange = (selectedIds: React.Key[]) => {
    const selectedItems = projects.filter((project) =>
      selectedIds.includes(project.id),
    );
    setSelectedProjects(selectedItems);
  };

  return (
    <div className={styles.componentRoot}>
      <ProjectModal
        selectedProjects={selectedProjects}
        isModalOpen={isModalOpen}
        onAdd={handleAddProject}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
      <ProjectTable
        projectBlocks={projects}
        onSelectChange={handleSelectChange}
      />
    </div>
  );
}
