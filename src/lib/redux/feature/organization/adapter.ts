import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { OrganizationType } from '../../../../domains/organization/model/types';

export const organizationAdapter = createEntityAdapter<
  OrganizationType,
  EntityId
>({
  selectId: (block) => block._id!,
});
