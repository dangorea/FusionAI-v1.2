import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { OrganizationManagementDataType } from './types';

export const userAdapter = createEntityAdapter<
  OrganizationManagementDataType,
  EntityId
>({
  selectId: (management) => management.userId,
});
