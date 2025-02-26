import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { OrganizationBlockDataType } from './types';

export const organizationAdapter = createEntityAdapter<
  OrganizationBlockDataType,
  EntityId
>({
  selectId: (block) => block.slug,
});
