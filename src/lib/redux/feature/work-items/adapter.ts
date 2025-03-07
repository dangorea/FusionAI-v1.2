import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { WorkItemType } from '../../../../domains/work-item/model/types';

export const workItemsAdapter = createEntityAdapter<WorkItemType, EntityId>({
  selectId: (item) => item.id,
});
