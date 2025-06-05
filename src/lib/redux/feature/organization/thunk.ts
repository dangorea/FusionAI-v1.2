import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import {
  createOrganizationBlock,
  deleteOrganizationBlock,
  readOrganizationBlocks,
  updateOrganizationBlock,
} from '../../../../api/organization-blocks';
import type { OrganizationType } from '../../../../domains/organization/model/types';

export const fetchOrganizationBlocks = createAsyncThunk<
  OrganizationType[],
  { page: number; limit: number; searchTerm?: string }
>(
  'organizations/fetchOrganizationBlocks',
  async (args, { rejectWithValue }) => {
    try {
      return await readOrganizationBlocks(
        args.page,
        args.limit,
        args.searchTerm,
      );
    } catch (error: any) {
      console.error('[Thunk] Failed to fetch organization blocks:', error);
      notification.error({ message: 'Failed to Fetch Organization Blocks' });
      return rejectWithValue(error);
    }
  },
);

export const createOrganizationThunk = createAsyncThunk<
  OrganizationType,
  { orgData: Omit<OrganizationType, 'id'> }
>(
  'organizations/createOrganization',
  async ({ orgData }, { rejectWithValue }) => {
    try {
      const newOrg = await createOrganizationBlock(orgData);
      notification.success({ message: 'Organization Created' });
      return { ...newOrg };
    } catch (error) {
      console.error('[Thunk] Failed to create organization:', error);
      notification.error({ message: 'Failed to Create Organization' });
      return rejectWithValue(error);
    }
  },
);

export const updateOrganizationThunk = createAsyncThunk<
  OrganizationType,
  {
    currentOrg: OrganizationType;
    updatedApiFields: Partial<OrganizationType>;
  }
>(
  'organizations/updateOrganization',
  async ({ currentOrg, updatedApiFields }, { rejectWithValue }) => {
    const hasApiChanges = Object.keys(updatedApiFields).length !== 0;

    try {
      const updatedOrg = hasApiChanges
        ? await updateOrganizationBlock(updatedApiFields, currentOrg.slug!)
        : currentOrg;

      notification.success({ message: 'Organization Updated' });
      return updatedOrg;
    } catch (error) {
      console.error('[Thunk] Failed to update organization:', error);
      notification.error({ message: 'Failed to Update Organization' });
      return rejectWithValue(error);
    }
  },
);

export const deleteOrganizationThunk = createAsyncThunk<
  string | number,
  { org: OrganizationType }
>('organizations/deleteOrganization', async ({ org }, { rejectWithValue }) => {
  try {
    await deleteOrganizationBlock(org.slug!);
    notification.success({ message: 'Organization Deleted' });
    return org.id;
  } catch (error) {
    console.error('[Thunk] Failed to delete organization:', error);
    notification.error({ message: 'Failed to Delete Organization' });
    return rejectWithValue(error);
  }
});
