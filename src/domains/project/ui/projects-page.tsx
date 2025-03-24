import React, { useState } from 'react';
import { notification } from 'antd';
import styles from './Projects.module.scss';
import { NOTIFICATION_DURATION_SHORT } from '../../../utils/notifications';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectAllProjects } from '../../../lib/redux/feature/projects/selectors';
import type { ProjectType } from '../model/type';

import {
  createProjectThunk,
  deleteProjectsThunk,
  updateProjectThunk,
} from '../../../lib/redux/feature/projects/thunk';
import { ProjectModal, ProjectTable } from '../components';

export function Projects() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [selectedProjects, setSelectedProjects] = useState<ProjectType[]>([]);

  const handleAddProject = async (
    newProject: Pick<ProjectType, 'name' | 'description'>,
  ) => {
    try {
      if (!org?.slug) throw new Error('No organization selected');

      await dispatch(
        createProjectThunk({
          orgSlug: org.slug,
          newProject,
        }),
      ).unwrap();

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

  const handleEditProject = async (
    updatedProject: Pick<ProjectType, 'id' | 'name' | 'description'>,
  ) => {
    try {
      if (!org?.slug) throw new Error('No organization selected');
      if (!updatedProject.id) {
        throw new Error('Project ID is missing for update.');
      }

      await dispatch(
        updateProjectThunk({
          orgSlug: org.slug,
          updatedProject,
        }),
      ).unwrap();

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
      if (!org?.slug) throw new Error('No organization selected');
      if (selectedProjects.length === 0) {
        notification.warning({
          message: 'No Projects Selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        return;
      }

      const projectIds = selectedProjects.map((p) => p.id);

      await dispatch(
        deleteProjectsThunk({
          orgSlug: org.slug,
          projectIds,
        }),
      ).unwrap();

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
