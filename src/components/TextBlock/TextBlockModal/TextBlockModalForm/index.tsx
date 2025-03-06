import React, { useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import styles from './TextBlockModalForm.module.scss';
import { RuleType } from '../../../../lib/redux/feature/rules/types';

interface TextBlockModalFormProps {
  onSubmit: (data: Omit<RuleType, 'id' | 'key'>) => void;
  block?: RuleType;
}

export function TextBlockModalForm({
  onSubmit,
  block,
}: TextBlockModalFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (block) {
      form.setFieldsValue({
        id: block.id,
        title: block.title,
        details: block.details,
      });
    }
  }, [block, form]);

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
        <Input placeholder="Your text's title..." />
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

export default TextBlockModalForm;
