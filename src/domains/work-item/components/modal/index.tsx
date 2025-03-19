import React, { useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import type { WorkItemType } from '../../model/types';
import { VoiceInput } from '../../../../components';

type PartialWorkItem = Pick<WorkItemType, 'description'>;

interface WorkItemsModalProps {
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | null;
  editingItemIds?: string[];
  allWorkItems?: WorkItemType[];
  onClose: () => void;
  onCreate: (data: PartialWorkItem) => void;
  onEdit: (data: PartialWorkItem) => void;
}

export function WorkItemsModal({
                                 isModalOpen,
                                 modalMode,
                                 editingItemIds = [],
                                 allWorkItems = [],
                                 onClose,
                                 onCreate,
                                 onEdit
                               }: WorkItemsModalProps) {
  const [form] = Form.useForm();

  const itemsToEdit = allWorkItems.filter((w) => editingItemIds.includes(w.id));

  useEffect(() => {
    if (modalMode === 'edit' && itemsToEdit.length === 1) {
      form.setFieldsValue({ description: itemsToEdit[0].description });
    } else {
      form.resetFields();
    }
  }, [modalMode, itemsToEdit, form]);

  const handleFinish = (value: PartialWorkItem) => {
    if (modalMode === 'edit') {
      onEdit(value);
    } else {
      onCreate(value);
    }
    form.resetFields();
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    const existing = form.getFieldValue('description') || '';
    form.setFieldsValue({ description: `${existing} ${transcribedText}` });
  };

  const title = modalMode === 'edit' ? 'Edit Work Item(s)' : 'Add Work Item';

  return (
    <Modal
      title={title}
      centered
      open={isModalOpen}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please input the description!' }
            ]}
            style={{ width: '100%' }}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <div>
            <VoiceInput
              onTranscriptionComplete={handleTranscriptionComplete}
              disabled={false}
            />
          </div>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
