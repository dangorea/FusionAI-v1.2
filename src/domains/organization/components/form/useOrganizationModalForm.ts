import { Form } from 'antd';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../../lib/redux/hook';
import type { OrganizationType } from '../../model/types';
import {
  createOrganizationThunk,
  updateOrganizationThunk,
} from '../../../../lib/redux/feature/organization/thunk';

type Props = {
  selectedOrganizations: OrganizationType[];
  setIsModalOpen: (isOpen: boolean) => void;
};

const useOrganizationModalForm = ({
  selectedOrganizations,
  setIsModalOpen,
}: Props) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    const [first] = selectedOrganizations;
    if (first) {
      form.setFieldsValue({
        name: first.name,
        description: first.description,
        slug: first.slug,
      });
    } else {
      form.resetFields();
    }
  }, [selectedOrganizations, form]);

  const handleFinish = useCallback(
    (values: { name: string; slug: string; description: string }) => {
      const [current] = selectedOrganizations;

      if (current) {
        const updatedApiFields: Partial<OrganizationType> = {};
        if (values.name !== current.name) updatedApiFields.name = values.name;
        if (values.description !== current.description)
          updatedApiFields.description = values.description;
        if (values.slug !== current.slug) updatedApiFields.slug = values.slug;

        dispatch(
          updateOrganizationThunk({
            currentOrg: current,
            updatedApiFields,
          }),
        );
      } else {
        dispatch(
          createOrganizationThunk({
            orgData: {
              name: values.name,
              description: values.description,
              slug: values.slug,
            },
          }),
        );
      }

      setIsModalOpen(false);
      form.resetFields();
    },
    [dispatch, form, selectedOrganizations, setIsModalOpen],
  );

  return { form, handleFinish };
};

export { useOrganizationModalForm };
