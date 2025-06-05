import { Button, Form, Input, Select } from 'antd';
import styles from './organization-management-modal-form.module.scss';
import type { OrganizationManagementDataType } from '../../../../lib/redux/feature/organization-management/types';
import { useOrganizationManagementModalForm } from './useOrganizationManagementModalForm';

interface OrganizationManagementModalFormProps {
  selectedManagements: OrganizationManagementDataType[];
  setIsModalOpen: (isOpen: boolean) => void;
}

function OrganizationManagementModalForm({
  selectedManagements,
  setIsModalOpen,
}: OrganizationManagementModalFormProps) {
  const { form, handleFinish } = useOrganizationManagementModalForm({
    selectedManagements,
    setIsModalOpen,
  });

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className={styles.form}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            type: 'email',
            message: 'Please input a valid Email!',
          },
        ]}
      >
        <Input placeholder="Enter Email address..." />
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

export { OrganizationManagementModalForm };
