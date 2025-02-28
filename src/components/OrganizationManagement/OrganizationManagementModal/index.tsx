import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { OrganizationManagementModalForm } from './OrganizationManagementModalForm';
import styles from './OrganizationManagementModal.module.scss';
import { OrganizationManagementDataType } from '../../../Context/OrganizationManagmentContext';

interface OrganizationManagementModalProps {
  selectedManagements: OrganizationManagementDataType[];
  isModalOpen: boolean;
  onClose: () => void;
  onAdd: (newManagement: OrganizationManagementDataType) => Promise<void>;
  onEdit: (updatedManagement: OrganizationManagementDataType) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function OrganizationManagementModal({
  selectedManagements,
  isModalOpen,
  onAdd,
  onEdit,
  onDelete,
}: OrganizationManagementModalProps) {
  const [open, setOpen] = useState(isModalOpen);

  const handleAdd = async (data: OrganizationManagementDataType) => {
    await onAdd(data);
    setOpen(false);
  };

  const handleEdit = async (data: OrganizationManagementDataType) => {
    if (selectedManagements.length > 0) {
      const managementToEdit = selectedManagements[0];
      const updatedData = { ...data, userId: managementToEdit.userId };

      try {
        await onEdit(updatedData);
      } catch (error) {
        console.error('Error editing management:', error);
      }
    }
    setOpen(false);
  };

  const handleDelete = async () => {
    await onDelete();
  };

  const isAddDisabled = selectedManagements.length > 0;
  const isEditDisabled = selectedManagements.length !== 1;
  const isDeleteDisabled = selectedManagements.length === 0;

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
            if (selectedManagements.length) setOpen(true);
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
        title="Organization Management Submission Form"
        centered
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        width={1000}
        footer={null}
      >
        <OrganizationManagementModalForm
          onSubmit={selectedManagements.length ? handleEdit : handleAdd}
          management={selectedManagements[0] || undefined}
        />
      </Modal>
    </>
  );
}
