import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { TextBlockModalForm } from './TextBlockModalForm';
import styles from './TextBlockModal.module.scss';
import { RuleType } from '../../../lib/redux/feature/rules/types';

interface TextBlockModalProps {
  selectedBlocks: RuleType[];
  isModalOpen: boolean;
  onAdd: (newBlock: Omit<RuleType, 'id'>) => Promise<void>;
  onEdit: (updatedBlock: RuleType) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function TextBlockModal({
  selectedBlocks,
  isModalOpen,
  onAdd,
  onEdit,
  onDelete,
}: TextBlockModalProps) {
  const [open, setOpen] = useState(isModalOpen);

  const handleAdd = async (data: Omit<RuleType, 'id'>) => {
    await onAdd(data);
    setOpen(false);
  };

  const handleEdit = async (data: Omit<RuleType, 'id'>) => {
    if (selectedBlocks.length > 0) {
      const blockToEdit = selectedBlocks[0];
      await onEdit({
        ...blockToEdit,
        ...data,
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
        title="Rules Submission Form"
        centered
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        width={1000}
        footer={null}
      >
        <TextBlockModalForm
          onSubmit={selectedBlocks.length ? handleEdit : handleAdd}
          block={selectedBlocks[0] || undefined}
        />
      </Modal>
    </>
  );
}
