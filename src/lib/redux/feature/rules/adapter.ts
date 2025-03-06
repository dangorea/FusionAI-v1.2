import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { RuleType } from './types';

export const rulesAdapter = createEntityAdapter<RuleType, EntityId>({
  selectId: (block) => block.id,
});
