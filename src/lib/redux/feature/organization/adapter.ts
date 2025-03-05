import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { OrganizationType } from './types';

export const organizationAdapter = createEntityAdapter<
  OrganizationBlockDataType,
  EntityId
>({
  selectId: (block) => block._id!,
});
