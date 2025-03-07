import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { OrganizationManagementDataType } from './types';

export const userAdapter = createEntityAdapter<
  OrganizationManagementDataType,
  EntityId
>({
  selectId: (management) => management.userId,
});
