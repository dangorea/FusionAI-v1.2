import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message, notification } from 'antd';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import { useAppDispatch, useAppSelector } from '../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../lib/redux/feature/projects/selectors';
import { selectSelectedWorkItemEntity } from '../../../lib/redux/feature/work-items/selectors';
import { updateContextThunk } from '../../../lib/redux/feature/context/thunk';
import { selectContext } from '../../../lib/redux/feature/context/selectors';

export function useImages() {
  const [imageGalleryVisible, setImageGalleryVisible] = useState(false);
  const [selectedImageIdsState, _setSelectedImageIds] = useState<string[]>([]);

  const lastSavedIdsRef = useRef<string[]>([]);
  const dirtyRef = useRef(false);

  const dispatch = useAppDispatch();
  const organization = useAppSelector(selectSelectedOrganizationEntity);
  const projectId = useAppSelector(selectSelectedProjectId);
  const workItem = useAppSelector(selectSelectedWorkItemEntity);
  const context = useAppSelector(selectContext);

  const setSelectedImageIds = useCallback((ids: string[]) => {
    dirtyRef.current = true;
    _setSelectedImageIds(ids);
  }, []);

  const debouncedSave = useMemo(
    () =>
      debounce(async (imageIds: string[]) => {
        if (
          !workItem?.contextId ||
          !dirtyRef.current ||
          !organization ||
          !projectId
        )
          return;

        const sorted = [...imageIds].sort();
        if (isEqual(sorted, lastSavedIdsRef.current)) return;

        try {
          await dispatch(
            updateContextThunk({
              contextId: workItem.contextId,
              orgSlug: organization.slug,
              projectId,
              updateData: { imageIds: sorted },
            }),
          ).unwrap();

          lastSavedIdsRef.current = sorted;
          dirtyRef.current = false;
        } catch (err) {
          console.error('Failed to update context images', err);
          message.error('Could not save image selection');
        }
      }, 400),
    [dispatch, workItem?.contextId],
  );

  useEffect(() => {
    if (!imageGalleryVisible || !dirtyRef.current) return;
    debouncedSave(selectedImageIdsState);
  }, [selectedImageIdsState, imageGalleryVisible, debouncedSave]);

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  useEffect(() => {
    if (!imageGalleryVisible) {
      _setSelectedImageIds([]);
      dirtyRef.current = false;
      return;
    }

    if (context?.images) {
      const storeIds = context.images.map((img) => img.id).sort();

      if (
        !dirtyRef.current &&
        !isEqual(storeIds, selectedImageIdsState.sort())
      ) {
        _setSelectedImageIds(storeIds);
        lastSavedIdsRef.current = storeIds;
      }
    }
  }, [imageGalleryVisible, context?.images]);

  const showImageGallery = useCallback(() => {
    if (!organization?.slug || !projectId || !workItem?.id) {
      notification.error({
        message: 'Cannot open image gallery',
        description: 'Missing organization, project, or work item information',
      });
      return;
    }
    setImageGalleryVisible(true);
  }, [organization?.slug, projectId, workItem?.id]);

  const hideImageGallery = useCallback(() => {
    setImageGalleryVisible(false);
  }, []);

  return {
    imageGalleryVisible,
    showImageGallery,
    hideImageGallery,

    selectedImageIds: selectedImageIdsState,
    setSelectedImageIds,
  };
}
