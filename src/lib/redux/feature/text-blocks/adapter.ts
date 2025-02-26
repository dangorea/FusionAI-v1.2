import { createEntityAdapter, EntityId } from '@reduxjs/toolkit';
import { TextBlockDataType } from './types';

export const textBlocksAdapter = createEntityAdapter<
  TextBlockDataType,
  EntityId
>({
  selectId: (block) => block.id,
});
