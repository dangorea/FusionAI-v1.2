import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../lib/redux/feature/organization/selectors';
import { fetchOrganizationBlocks } from '../../lib/redux/feature/organization/thunk';
import { fetchProjects } from '../../lib/redux/feature/projects/thunk';
import { fetchTextBlocks } from '../../lib/redux/feature/text-blocks/thunk';
import { fetchOrganizationManagements } from '../../lib/redux/feature/organization-management/thunk';
import { fetchProviders } from '../../lib/redux/feature/config/thunk';
import { TextBlockCategory } from '../../lib/redux/feature/text-blocks/types';
import { selectSelectedProject } from '../../lib/redux/feature/projects/selectors';

type Props = {
  children: ReactNode;
};

const defaultPaginationParams = { page: 1, limit: 10 };

export function Trigger({ children }: Props) {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const project = useAppSelector(selectSelectedProject);
  const projectId = project?.id;
  const orgSlug = org?.slug;

  useEffect(() => {
    if (orgSlug && projectId) {
      dispatch(fetchProviders({ orgSlug, projectId: projectId ?? '' }));
    }
  }, [dispatch, orgSlug, projectId]);

  useEffect(() => {
    dispatch(fetchOrganizationBlocks(defaultPaginationParams));
  }, [dispatch]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(fetchProjects({ orgSlug, ...defaultPaginationParams }));
    }
  }, [dispatch, orgSlug]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(
        fetchTextBlocks({
          orgSlug,
          ...defaultPaginationParams,
          blockType: TextBlockCategory.KNOWLEDGE,
          projectId,
        }),
      );
    }
  }, [dispatch, orgSlug, projectId]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(
        fetchTextBlocks({
          orgSlug,
          ...defaultPaginationParams,
          blockType: TextBlockCategory.PERSONALITY,
          projectId,
        }),
      );
    }
  }, [dispatch, orgSlug, projectId]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(
        fetchOrganizationManagements({ orgSlug, ...defaultPaginationParams }),
      );
    }
  }, [dispatch, orgSlug]);

  return children;
}
