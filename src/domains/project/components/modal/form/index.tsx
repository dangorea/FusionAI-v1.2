import React, { useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import styles from './project-modal-form.module.scss';
import type { ProjectType } from '../../../model/type';

interface ProjectModalFormProps {
  onSubmit: (data: { name: string; description: string }) => void;
  project: ProjectType;
}

export function ProjectModalForm({ onSubmit, project }: ProjectModalFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
      });
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleFinish = (values: { name: string; description: string }) => {
    onSubmit({
      name: values.name,
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
        label="Title"
        name="name"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input placeholder="Your project's title..." />
      </Form.Item>
      <Form.Item
        label="Content"
        name="description"
        rules={[{ required: true, message: 'Please input the content!' }]}
      >
        <Input.TextArea
          placeholder="Enter text here..."
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

export default ProjectModalForm;
