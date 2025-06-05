import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { TextBlockType } from './types';

export const knowledgeAdapter = createEntityAdapter<TextBlockType, EntityId>({
  selectId: (block) => block.id,
});

export const personalityAdapter = createEntityAdapter<TextBlockType, EntityId>({
  selectId: (block) => block.id,
});
