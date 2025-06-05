import { Form, notification } from 'antd';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { NOTIFICATION_DURATION_SHORT } from '../../../../utils/notifications';
import type { OrganizationManagementDataType } from '../../../../lib/redux/feature/organization-management/types';
// import { createInvitation } from '../../../../api/invitations';
import {
  addOrganizationManagement,
  editOrganizationManagement,
} from '../../../../lib/redux/feature/organization-management/reducer';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import { createInvitation } from '../../../../api/organization-management';

type Props = {
  selectedManagements: OrganizationManagementDataType[];
  setIsModalOpen: (isOpen: boolean) => void;
};

const useOrganizationManagementModalForm = ({
  selectedManagements,
  setIsModalOpen,
}: Props) => {
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    const [firstManagement] = selectedManagements;
    if (firstManagement) {
      form.setFieldsValue({
        email: firstManagement.email,
        roles: firstManagement.roles,
      });
    } else {
      form.resetFields();
    }
  }, [selectedManagements, form]);

  const handleEdit = useCallback(
    (orgData) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else {
        const [firstManagement] = selectedManagements;
        const updatedData = { ...orgData, email: firstManagement.email };
        dispatch(editOrganizationManagement(updatedData));
        notification.success({
          message: 'Member Role Updated',
          duration: NOTIFICATION_DURATION_SHORT,
        });
        form.resetFields();
        setIsModalOpen(false);
      }
    },
    [dispatch, form, org, selectedManagements, setIsModalOpen],
  );

  const handleAdd = useCallback(
    (orgData) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else {
        createInvitation(org.slug, orgData)
          .then((createdInvitation) => {
            dispatch(
              addOrganizationManagement({
                email: createdInvitation.email,
                roles: createdInvitation.roles,
              }),
            );
            notification.success({
              message: 'Invitation Sent',
              duration: NOTIFICATION_DURATION_SHORT,
            });
          })
          .catch(() => {
            notification.error({
              message: 'Failed to Send Invitation',
              duration: NOTIFICATION_DURATION_SHORT,
            });
          })
          .finally(() => {
            form.resetFields();
            setIsModalOpen(false);
          });
      }
    },
    [dispatch, form, org, setIsModalOpen],
  );

  const handleFinish = (orgData: { email: string; roles: string[] }) => {
    if (selectedManagements.length) handleEdit(orgData);
    else handleAdd(orgData);
  };

  return { form, handleFinish };
};

export { useOrganizationManagementModalForm };
