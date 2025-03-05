import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectModalForm } from './ProjectModalForm';
import styles from './ProjectModal.module.scss';
import { ProjectType } from '../../../domains/project/model/type';

interface ProjectModalProps {
  selectedProjects: ProjectType[];
  onAdd: (newProject: Pick<ProjectType, 'title' | 'details'>) => Promise<void>;
  onEdit: (
    updatedProject: Pick<ProjectType, 'id' | 'title' | 'details'>,
  ) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ProjectModal({
  selectedProjects,
  onAdd,
  onEdit,
  onDelete,
}: ProjectModalProps) {
  const [open, setOpen] = useState(false);

  const handleAdd = async (data: { title: string; details: string }) => {
    await onAdd(data);
    setOpen(false);
  };

  const handleEdit = (data: { title: string; details: string }) => {
    if (selectedProjects.length > 0) {
      const projectToEdit = selectedProjects[0];
      onEdit({ ...data, id: projectToEdit.id });
    }
    setOpen(false);
  };

  const handleDelete = async () => {
    if (selectedProjects.length > 0) {
      await onDelete();
    }
  };

  const isAddDisabled = selectedProjects.length > 0;
  const isEditDisabled = selectedProjects.length !== 1;
  const isDeleteDisabled = selectedProjects.length === 0;

  return (
    <>
      <div className={styles.buttonContainer}>
        <Button
          onClick={() => setOpen(true)}
          icon={<PlusOutlined />}
          type="text"
          disabled={isAddDisabled}
        />
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => {
            if (selectedProjects.length) setOpen(true);
          }}
          disabled={isEditDisabled}
        />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          disabled={isDeleteDisabled}
        />
      </div>

      <Modal
        title="Project Submission Form"
        centered
        open={open}
        onCancel={() => setOpen(false)}
        width={1000}
        footer={null}
      >
        <ProjectModalForm
          onSubmit={selectedProjects.length ? handleEdit : handleAdd}
          project={selectedProjects[0] || null}
        />
      </Modal>
    </>
  );
}
