import React from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { WorkItem } from '../../../api/types/WorkItem';

interface WorkItemsModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Pick<WorkItem, 'description' | 'projectId'>) => void;
}

export const WorkItemsModal: React.FC<WorkItemsModalProps> = ({
  isModalOpen,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: { id?: string; description: string }) => {
    const data = {
      id: values.id,
      description: values.description,
    };

    onSubmit(data);
    form.resetFields();
  };

  return (
    <Modal
      title="Add Work Item"
      centered
      open={isModalOpen}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <Input.TextArea placeholder="Enter description" rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
