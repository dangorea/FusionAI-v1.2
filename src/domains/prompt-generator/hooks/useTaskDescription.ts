import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import type { DebouncedFunc } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { updateWorkItemThunk } from '../../../lib/redux/feature/work-items/thunk';
import type { TaskDescriptionInputRef } from '../components';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import type { DropdownRef } from '../../../components';
import { selectSelectedIteration } from '../../../lib/redux/feature/artifacts/selectors';
import { extractIterationLabel } from '../utils/iteration';

interface UseTaskDescriptionReturn {
  dropdownProviderRef: RefObject<DropdownRef | null>;
  personalityDropdownHeaderRef: RefObject<DropdownRef | null>;
  personalityDropdownContentRef: RefObject<DropdownRef | null>;
  personalityDropdownFooterRef: RefObject<DropdownRef | null>;
  bigTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  onBigTaskDescMount: (api: TaskDescriptionInputRef) => void;
  bigTaskDescription: string;
  setBigTaskDescription: Dispatch<SetStateAction<string>>;
  disableSendBigTaskDescription: boolean;
  smallTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  smallTaskDescription: string;
  setSmallTaskDescription: Dispatch<SetStateAction<string>>;
  disableSmallTaskDescription: boolean;
  previewTaskDescRef: RefObject<TaskDescriptionInputRef | null>;
  previewTaskDescriptionPreviewMode: boolean;
  setPreviewTaskDescriptionPreviewMode: Dispatch<SetStateAction<boolean>>;
  previewTaskDescription: string;
  setPreviewTaskDescription: Dispatch<SetStateAction<string>>;
  handlePreviewTaskDescMount: (api: TaskDescriptionInputRef) => void;
  disablePreviewTaskDescription: boolean;
  updateTaskDescription: DebouncedFunc<() => Promise<void>>;
  setUserIsEditing: Dispatch<SetStateAction<boolean>>;
  setHasLocalDescriptionChanged: Dispatch<SetStateAction<boolean>>;
}

export function useTaskDescription(): UseTaskDescriptionReturn {
  const bigTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const smallTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const previewTaskDescRef = useRef<TaskDescriptionInputRef | null>(null);
  const dropdownProviderRef = useRef<DropdownRef | null>(null);
  const personalityDropdownHeaderRef = useRef<DropdownRef | null>(null);
  const personalityDropdownContentRef = useRef<DropdownRef | null>(null);
  const personalityDropdownFooterRef = useRef<DropdownRef | null>(null);

  const [bigTaskDescription, setBigTaskDescription] = useState<string>('');
  const [smallTaskDescription, setSmallTaskDescription] = useState<string>('');
  const [previewTaskDescription, setPreviewTaskDescription] =
    useState<string>('');
  const [
    previewTaskDescriptionPreviewMode,
    setPreviewTaskDescriptionPreviewMode,
  ] = useState<boolean>(true);

  const dispatch = useAppDispatch();
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const orgSlug = org?.slug;
  const projectId = useAppSelector(selectSelectedProjectId);
  const selectedIteration = useAppSelector(selectSelectedIteration);

  const [userIsEditing, setUserIsEditing] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [hasLocalDescriptionChanged, setHasLocalDescriptionChanged] =
    useState(false);
  const requestControllerRef = useRef<AbortController | null>(null);

  const disableSendBigTaskDescription =
    (bigTaskDescription.trim() || '') === '';
  const disableSmallTaskDescription =
    (smallTaskDescription.trim() || '') === '';
  const disablePreviewTaskDescription =
    (previewTaskDescription.trim() || '') === '' &&
    !previewTaskDescriptionPreviewMode;

  useEffect(() => {
    if (
      workItem?.description &&
      bigTaskDescRef.current &&
      !userIsEditing &&
      !updateInProgress
    ) {
      bigTaskDescRef.current.setContent(workItem.description);
      setBigTaskDescription(workItem.description);
    }
  }, [workItem?.description, userIsEditing, updateInProgress]);

  const onBigTaskDescMount = (api: TaskDescriptionInputRef) => {
    if (workItem?.description && !userIsEditing && !updateInProgress) {
      api.setContent(workItem.description);
      setBigTaskDescription(workItem.description);
    }
  };

  const handlePreviewTaskDescMount = (api: TaskDescriptionInputRef) => {
    if (selectedIteration) {
      const promptText = selectedIteration.prompt || '';
      const additionalInfo = extractIterationLabel(promptText, 98);
      api.setContent(additionalInfo);
    }
  };

  const updateTaskDescription = useCallback(
    debounce(async () => {
      if (!workItem || !orgSlug || !projectId) {
        setHasLocalDescriptionChanged(false);
        return;
      }

      setUpdateInProgress(true);

      const currentBig = bigTaskDescRef.current?.getContent() || '';
      const currentSmall = smallTaskDescRef.current?.getContent() || '';
      const newDescription = currentSmall || currentBig;

      if (newDescription === workItem.description) {
        setHasLocalDescriptionChanged(false);
        setUpdateInProgress(false);
        return;
      }

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
      const controller = new AbortController();
      requestControllerRef.current = controller;

      try {
        await dispatch(
          updateWorkItemThunk({
            orgSlug,
            projectId,
            workItem: {
              id: workItem.id,
              description: newDescription,
            },
            signal: controller.signal,
          }),
        );
      } catch (error: any) {
        if (error.name === 'AbortError') {
          controller.abort();
        }
      } finally {
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
          setUpdateInProgress(false);
          setHasLocalDescriptionChanged(false);
        }
      }
    }, 700),
    [dispatch, workItem, orgSlug, projectId],
  );

  useEffect(() => {
    if (hasLocalDescriptionChanged) {
      updateTaskDescription();
    } else {
      updateTaskDescription.cancel();
    }
    return () => updateTaskDescription.cancel();
  }, [hasLocalDescriptionChanged, updateTaskDescription]);

  return {
    dropdownProviderRef,
    personalityDropdownHeaderRef,
    personalityDropdownContentRef,
    personalityDropdownFooterRef,
    bigTaskDescRef,
    onBigTaskDescMount,
    bigTaskDescription,
    setBigTaskDescription,
    disableSendBigTaskDescription,
    smallTaskDescRef,
    smallTaskDescription,
    setSmallTaskDescription,
    disableSmallTaskDescription,
    previewTaskDescRef,
    previewTaskDescriptionPreviewMode,
    setPreviewTaskDescriptionPreviewMode,
    previewTaskDescription,
    setPreviewTaskDescription,
    handlePreviewTaskDescMount,
    disablePreviewTaskDescription,
    updateTaskDescription,
    setUserIsEditing,
    setHasLocalDescriptionChanged,
  };
}
