import { Button, Form, Input } from 'antd';
import styles from './project-modal-form.module.scss';
import type { ProjectType } from '../../model/type';
import { useProjectModalForm } from './useProjectModalForm';
import { DirectorySelector } from '../../../../components';

type ProjectModalFormProps = {
  selectedProjects: ProjectType[];
  setIsModalOpen: (isOpen: boolean) => void;
};

function ProjectModalForm({
  selectedProjects,
  setIsModalOpen,
}: ProjectModalFormProps) {
  const { form, handleFinish, handleSelectDirectory, loading, directoryPath } =
    useProjectModalForm({
      selectedProjects,
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
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input the name!' }]}
      >
        <Input placeholder="Your project's name..." />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea
          placeholder="Enter text here..."
          style={{ minHeight: '300px' }}
        />
      </Form.Item>
      <div className={styles.directorySelectorContainer}>
        <DirectorySelector
          loading={loading}
          handleSelectDirectory={handleSelectDirectory}
          directoryPath={directoryPath}
        />
      </div>
      <Form.Item className={styles.submitButtonForm}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export { ProjectModalForm };
