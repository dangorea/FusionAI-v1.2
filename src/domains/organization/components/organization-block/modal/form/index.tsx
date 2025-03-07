import React, { useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import styles from './organization-block-modal-form.module.scss';
import type { OrganizationType } from '../../../../model/types';

interface OrganizationBlockModalFormProps {
  onSubmit: (data: Omit<OrganizationType, '_id' | 'key'>) => void;
  block?: OrganizationType;
}

export function OrganizationModalForm({
  onSubmit,
  block,
}: OrganizationBlockModalFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (block) {
      form.setFieldsValue({
        name: block.name,
        description: block.description,
        slug: block.slug,
      });
    }
  }, [block, form]);

  const handleFinish = (values: {
    name: string;
    slug: string;
    description: string;
  }) => {
    onSubmit({
      name: values.name,
      slug: values.slug,
      description: values.description,
    });
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className={styles.form}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[
          { required: true, message: 'Please input the organization name!' },
        ]}
      >
        <Input placeholder="Organization name..." />
      </Form.Item>
      <Form.Item
        label="Slug"
        name="slug"
        rules={[
          { required: true, message: 'Please input the organization slug!' },
        ]}
      >
        <Input placeholder="Organization slug..." />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Please input the description!' }]}
      >
        <Input.TextArea
          placeholder="Enter description here..."
          style={{ minHeight: '300px' }}
        />
      </Form.Item>
      <Form.Item className={styles.submitButtonForm}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
