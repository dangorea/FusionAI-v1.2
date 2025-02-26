import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { WorkItem } from '../../../../types/common';

export const workItemsAdapter = createEntityAdapter<WorkItem, EntityId>({
  selectId: (item) => item.id,
});
