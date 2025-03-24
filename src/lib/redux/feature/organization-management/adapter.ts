import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { OrganizationManagementDataType } from './types';

export const organizationManagementAdapter = createEntityAdapter<
  OrganizationManagementDataType,
  EntityId
>({
  selectId: (management) => management.userId,
});
