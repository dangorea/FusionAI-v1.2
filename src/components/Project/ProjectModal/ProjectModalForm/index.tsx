import React, { useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import styles from './ProjectModal.module.scss';
import { DataType } from '../../../../types/common';

interface ProjectModalFormProps {
  onSubmit: (data: { title: string; details: string }) => void;
  project: DataType;
}

export function ProjectModalForm({ onSubmit, project }: ProjectModalFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        title: project.title,
        details: project.details,
      });
    }
  }, [project, form]);

  const handleFinish = (values: { title: string; details: string }) => {
    onSubmit({
      title: values.title,
      details: values.details,
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
        name="title"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input placeholder="Your project's title..." />
      </Form.Item>
      <Form.Item
        label="Content"
        name="details"
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
