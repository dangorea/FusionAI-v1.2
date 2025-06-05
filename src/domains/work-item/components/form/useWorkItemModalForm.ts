import { Form, notification } from 'antd';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import {
  NOTIFICATION_DURATION_LONG,
  NOTIFICATION_DURATION_SHORT,
} from '../../../../utils/notifications';
import {
  createWorkItemThunk,
  loadWorkItemsThunk,
  updateWorkItemThunk,
} from '../../../../lib/redux/feature/work-items/thunk';
import { selectSelectedProjectId } from '../../../../lib/redux/feature/projects/selectors';
import { setSelectedWorkItem } from '../../../../lib/redux/feature/work-items/reducer';
import type { WorkItemType } from '../../model/types';
import { clearContext } from '../../../../lib/redux/feature/context/reducer';
import { clearArtifact } from '../../../../lib/redux/feature/artifacts/reducer';

type Props = {
  selectedWorkItems: any[] | null;
  setIsModalOpen: (isOpen: boolean) => void;
  currentPage: number;
  pageSize: number;
};

const useWorkItemModalForm = ({
  selectedWorkItems,
  setIsModalOpen,
  currentPage,
  pageSize,
}: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedWorkItems) {
      const [firstWorkItem] = selectedWorkItems;

      if (firstWorkItem) {
        form.setFieldsValue({ description: firstWorkItem.description });
      } else {
        form.resetFields();
      }
    }
  }, [selectedWorkItems, form]);

  const handleEdit = useCallback(
    async (workItemData: Partial<WorkItemType>) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else if (!selectedProjectId) {
        notification.error({
          message: 'No project selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else if (selectedWorkItems) {
        const [firstWorkItem] = selectedWorkItems;
        const updatedWorkItem = {
          id: firstWorkItem.id,
          description: workItemData.description,
        };

        await dispatch(
          updateWorkItemThunk({
            orgSlug: org.slug,
            projectId: selectedProjectId,
            workItem: updatedWorkItem,
          }),
        )
          .catch((err) => {
            notification.error({
              message: 'Failed to Update Work Item',
              duration: NOTIFICATION_DURATION_SHORT,
            });
            return err;
          })
          .finally(() => {
            form.resetFields();
            setIsModalOpen(false);
          });

        await dispatch(
          loadWorkItemsThunk({
            page: currentPage,
            limit: pageSize,
            orgSlug: org.slug,
            projectId: selectedProjectId,
          }),
        );
      }
    },
    [
      currentPage,
      dispatch,
      form,
      org,
      pageSize,
      selectedProjectId,
      selectedWorkItems,
      setIsModalOpen,
    ],
  );

  const handleAdd = useCallback(
    async (newWorkItem: WorkItemType) => {
      if (!org?.slug) {
        notification.error({
          message: 'No organization selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else if (!selectedProjectId) {
        notification.error({
          message: 'No project selected',
          duration: NOTIFICATION_DURATION_SHORT,
        });
      } else {
        const response = await dispatch(
          createWorkItemThunk({
            orgSlug: org.slug,
            projectId: selectedProjectId || '',
            description: newWorkItem.description,
          }),
        )
          .catch(() => {
            notification.error({
              message: 'Failed to Add Work Item',
              duration: NOTIFICATION_DURATION_LONG,
            });
          })
          .finally(() => {
            form.resetFields();
            setIsModalOpen(false);
          });

        if (createWorkItemThunk.fulfilled.match(response)) {
          const createdWorkItem = response.payload;
          notification.success({
            message: 'Work Item Added',
            duration: NOTIFICATION_DURATION_LONG,
          });

          dispatch(clearContext());
          dispatch(clearArtifact());

          dispatch(setSelectedWorkItem(createdWorkItem.id));
          navigate(`/prompt-generator/${createdWorkItem.id}`);

          dispatch(
            loadWorkItemsThunk({
              page: currentPage,
              limit: pageSize,
              orgSlug: org.slug,
              projectId: selectedProjectId || '',
            }),
          );
        } else {
          notification.error({
            message: 'Failed to Add Work Item',
            duration: NOTIFICATION_DURATION_LONG,
          });
        }
      }
    },
    [
      currentPage,
      dispatch,
      form,
      navigate,
      org,
      pageSize,
      selectedProjectId,
      selectedWorkItems,
      setIsModalOpen,
    ],
  );

  const handleTranscriptionComplete = (transcribedText: string) => {
    const existing = form.getFieldValue('description') || '';
    form.setFieldsValue({ description: `${existing} ${transcribedText}` });
  };

  const handleFinish = (workItemData: WorkItemType) => {
    if (selectedWorkItems?.length) handleEdit(workItemData);
    else handleAdd(workItemData);
  };

  return { form, handleFinish, handleTranscriptionComplete };
};

export { useWorkItemModalForm };
