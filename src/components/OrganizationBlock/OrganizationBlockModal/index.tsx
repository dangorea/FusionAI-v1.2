import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { OrganizationBlockModalForm } from './OrganizationBlockModalForm';
import styles from './OrganizationBlockModal.module.scss';
import { OrganizationBlockDataType } from '../../../Context/OrganizationItemsContext';

interface OrganizationBlockModalProps {
  selectedBlocks: OrganizationBlockDataType[];
  isModalOpen: boolean;
  onClose: () => void;
  onAdd: (newBlock: Omit<OrganizationBlockDataType, '_id'>) => Promise<void>;
  onEdit: (
    updatedBlock: OrganizationBlockDataType,
    previousSlug: string,
  ) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function OrganizationBlockModal({
  selectedBlocks,
  isModalOpen,
  onAdd,
  onEdit,
  onDelete,
}: OrganizationBlockModalProps) {
  const [open, setOpen] = useState(isModalOpen);

  const handleAdd = async (data: Omit<OrganizationBlockDataType, '_id'>) => {
    await onAdd(data);
    setOpen(false);
  };

  const handleEdit = (data: Omit<OrganizationBlockDataType, '_id'>) => {
    if (selectedBlocks.length > 0) {
      const blockToEdit = selectedBlocks[0];

      const updatedData = { ...data };

      onEdit(updatedData, blockToEdit.slug)
        .then()
        .catch((error) => {
          console.error('Error editing block:', error);
        });
    }
    setOpen(false);
  };

  const handleDelete = async () => {
    await onDelete();
  };

  const isAddDisabled = selectedBlocks.length > 0;
  const isEditDisabled = selectedBlocks.length !== 1;
  const isDeleteDisabled = selectedBlocks.length === 0;

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
            if (selectedBlocks.length) setOpen(true);
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
        title="Organization Submission Form"
        centered
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        width={1000}
        footer={null}
      >
        <OrganizationBlockModalForm
          onSubmit={selectedBlocks.length ? handleEdit : handleAdd}
          block={selectedBlocks[0] || undefined}
        />
      </Modal>
    </>
  );
}
