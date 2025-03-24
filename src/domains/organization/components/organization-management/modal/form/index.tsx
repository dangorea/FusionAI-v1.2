import React, { useEffect } from 'react';
import { Button, Form, Input, Select } from 'antd';
import styles from './organization-management-modal-form.module.scss';
import type { OrganizationManagementDataType } from '../../../../../../lib/redux/feature/organization-management/types';

interface OrganizationManagementModalFormProps {
  onSubmit: (data: OrganizationManagementDataType) => void;
  management?: OrganizationManagementDataType;
}

export function OrganizationManagementModalForm({
  onSubmit,
  management,
}: OrganizationManagementModalFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (management) {
      form.setFieldsValue({
        userId: management.userId,
        roles: management.roles,
      });
    }
  }, [management, form]);

  const handleFinish = (values: { userId: string; roles: string[] }) => {
    onSubmit({
      userId: values.userId,
      roles: values.roles,
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
        label="User ID"
        name="userId"
        rules={[{ required: true, message: 'Please input the User ID!' }]}
      >
        <Input placeholder="Enter User ID..." />
      </Form.Item>
      <Form.Item
        label="Roles"
        name="roles"
        rules={[
          { required: true, message: 'Please select at least one role!' },
        ]}
      >
        <Select mode="multiple" placeholder="Select roles">
          <Select.Option value="owner">Owner</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="member">Member</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item className={styles.submitButtonForm}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
