import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { RuleType } from './types';

export const rulesAdapter = createEntityAdapter<RuleType, EntityId>({
  selectId: (block) => block.id,
});
