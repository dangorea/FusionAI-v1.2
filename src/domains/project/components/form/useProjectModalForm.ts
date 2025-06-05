import { Form, notification } from 'antd';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import { NOTIFICATION_DURATION_SHORT } from '../../../../utils/notifications';
import {
  createProjectThunk,
  updateProjectThunk,
} from '../../../../lib/redux/feature/projects/thunk';
import type { ProjectType } from '../../model/type';
import { useDirectorySelector } from '../../../../components/directoty-selector/useDirectorySelector';
import { getProjectPath } from '../../../../utils/project/path';

type Props = {
  selectedProjects: ProjectType[];
  setIsModalOpen: (isOpen: boolean) => void;
};

const useProjectModalForm = ({ selectedProjects, setIsModalOpen }: Props) => {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const [form] = Form.useForm();

  const { handleSelectDirectory, handleSaveDirectory, loading, directoryPath } =
    useDirectorySelector(selectedProjects[0]?.id || null);

  useEffect(() => {
    const [first] = selectedProjects;
    if (first) {
      form.setFieldsValue({
        name: first.name,
        description: first.description,
      });
    } else {
      form.resetFields();
    }
  }, [selectedProjects, form]);

  const handleEdit = useCallback(
    (projectData: Pick<ProjectType, 'name' | 'description'>) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        return;
      }

      const [current] = selectedProjects;
      const updatedApiFields: Partial<ProjectType> = {};
      if (projectData.name !== current.name)
        updatedApiFields.name = projectData.name;
      if (projectData.description !== current.description)
        updatedApiFields.description = projectData.description;

      const savedPath = getProjectPath(current.id) ?? null;
      const pathChanged = directoryPath !== savedPath;
      const hasApiChanges = Object.keys(updatedApiFields).length !== 0;

      if (!hasApiChanges) {
        if (pathChanged) {
          handleSaveDirectory(current.id);
          notification.success({
            message: 'Project Path Updated',
            duration: NOTIFICATION_DURATION_SHORT,
          });
        }
        form.resetFields();
        setIsModalOpen(false);
        return;
      }

      dispatch?.(
        updateProjectThunk({
          orgSlug: org.slug,
          updatedProject: { ...updatedApiFields, id: current.id },
        }),
      )
        .unwrap()
        .catch((err) => {
          notification.error({
            message: 'Failed to Update Project',
            duration: NOTIFICATION_DURATION_SHORT,
          });
          return err;
        })
        .finally(() => {
          if (pathChanged) handleSaveDirectory(current.id);
          form.resetFields();
          setIsModalOpen(false);
        });
    },
    [
      dispatch,
      directoryPath,
      form,
      handleSaveDirectory,
      org,
      selectedProjects,
      setIsModalOpen,
    ],
  );

  const handleAdd = useCallback(
    (newProject: Pick<ProjectType, 'name' | 'description'>) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        return;
      }

      dispatch?.(
        createProjectThunk({
          orgSlug: org.slug,
          newProject,
        }),
      )
        .unwrap()
        .then((response) => {
          handleSaveDirectory(response.id);
        })
        .catch(() => {
          notification.error({
            message: 'Failed to Add Project',
            duration: NOTIFICATION_DURATION_SHORT,
          });
        })
        .finally(() => {
          form.resetFields();
          setIsModalOpen(false);
        });
    },
    [dispatch, form, handleSaveDirectory, org, setIsModalOpen],
  );

  const handleFinish = (
    projectData: Pick<ProjectType, 'name' | 'description'>,
  ) => {
    if (selectedProjects.length) handleEdit(projectData);
    else handleAdd(projectData);
  };

  return { form, handleFinish, handleSelectDirectory, loading, directoryPath };
};

export { useProjectModalForm };
