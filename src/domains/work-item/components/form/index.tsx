import { Button, Form, Input } from 'antd';
import React from 'react';
import { useWorkItemModalForm } from './useWorkItemModalForm';
import { VoiceInput } from '../../../../components';
import styles from './work-item-modal-form.module.scss';

type WorkItemModalFormProps = {
  selectedWorkItems: any[] | null;
  setIsModalOpen: (isOpen: boolean) => void;
  currentPage: number;
  pageSize: number;
};

function WorkItemModalForm({
  selectedWorkItems,
  setIsModalOpen,
  currentPage,
  pageSize,
}: WorkItemModalFormProps) {
  const { form, handleFinish, handleTranscriptionComplete } =
    useWorkItemModalForm({
      selectedWorkItems,
      setIsModalOpen,
      currentPage,
      pageSize,
    });

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className={styles.form}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
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

      <Form.Item className={styles.submitButtonForm}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export { WorkItemModalForm };
