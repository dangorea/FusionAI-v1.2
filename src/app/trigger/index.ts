import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../lib/redux/feature/organization/selectors';
import { fetchOrganizationBlocks } from '../../lib/redux/feature/organization/thunk';
import { fetchProjects } from '../../lib/redux/feature/projects/thunk';
import { fetchRules } from '../../lib/redux/feature/rules/thunk';
import { fetchOrganizationManagements } from '../../lib/redux/feature/organization-management/thunk';
import { fetchProviders } from '../../lib/redux/feature/config/thunk';

type Props = {
  children: ReactNode;
};

export function Trigger({ children }: Props) {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const orgSlug = org?.slug;

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchOrganizationBlocks());
  }, [dispatch]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(fetchProjects(orgSlug));
    }
  }, [dispatch, orgSlug]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(fetchRules(orgSlug));
    }
  }, [dispatch, orgSlug]);

  useEffect(() => {
    if (orgSlug) {
      dispatch(fetchOrganizationManagements(orgSlug));
    }
  }, [dispatch, orgSlug]);

  return children;
}
