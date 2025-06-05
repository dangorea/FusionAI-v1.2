import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input } from 'antd';
import debounce from 'lodash.debounce';
import styles from './organization-block-modal-form.module.scss';
import type { OrganizationType } from '../../model/types';
import { useOrganizationModalForm } from './useOrganizationModalForm';
import { checkSlugAvailable } from '../../../../api/organization-blocks';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

type OrganizationBlockModalFormProps = {
  selectedOrganizations: OrganizationType[];
  setIsModalOpen: (isOpen: boolean) => void;
};

export function OrganizationModalForm({
  selectedOrganizations,
  setIsModalOpen,
}: OrganizationBlockModalFormProps) {
  const { form, handleFinish } = useOrganizationModalForm({
    selectedOrganizations,
    setIsModalOpen,
  });

  const originalSlug = selectedOrganizations[0]?.slug;
  const isEditing = Boolean(originalSlug);

  const [slugFocused, setSlugFocused] = useState(false);

  const nameValue = Form.useWatch('name', form);

  useEffect(() => {
    if (!isEditing && !slugFocused && typeof nameValue === 'string') {
      const generated = slugify(nameValue);
      form.setFieldsValue({ slug: generated });
      form.validateFields(['slug']);
    }
  }, [nameValue, isEditing, slugFocused, form]);

  const debouncedCheck = useMemo(
    () =>
      debounce(
        async (
          value: string,
          resolve: VoidFunction,
          reject: (err: Error) => void,
        ) => {
          try {
            const available = await checkSlugAvailable(value);
            if (available) {
              resolve();
            } else {
              reject(new Error('Slug is already in use'));
            }
          } catch {
            reject(new Error('Unable to validate slug'));
          }
        },
        500,
      ),
    [],
  );

  useEffect(() => {
    return () => debouncedCheck.cancel();
  }, [debouncedCheck]);

  const slugValidator = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please input the organization slug!'));
    }
    if (isEditing && value === originalSlug) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      debouncedCheck(value, resolve, (err) => reject(err));
    });
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
        hasFeedback
        validateTrigger={['onChange']}
        normalize={(val: string) =>
          typeof val === 'string' ? val.replace(/\s+/g, '') : val
        }
        rules={[{ validator: slugValidator }]}
      >
        <Input
          placeholder="Organization slug..."
          onFocus={() => setSlugFocused(true)}
        />
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
