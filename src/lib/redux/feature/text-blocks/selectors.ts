import { RootState } from '../../store';
import { textBlocksAdapter } from './adapter';

// 1) Get the slice from the RootState
const selectTextBlocksState = (state: RootState) => state.textBlocks;

// 2) Create adapter-based selectors
export const {
  selectAll: selectAllTextBlocks,
  selectById: selectTextBlockById,
  selectEntities: selectTextBlockEntities,
  selectIds: selectTextBlockIds,
  selectTotal: selectTextBlockTotal,
} = textBlocksAdapter.getSelectors<RootState>(selectTextBlocksState);

// If you had a “selectedTextBlockId” in your slice, you could also do:
//
// export const selectSelectedTextBlockId = createSelector(
//   selectTextBlocksState,
//   (state) => state.selectedTextBlockId,
// );
//
// export const selectSelectedTextBlock = createSelector(
//   [selectSelectedTextBlockId, selectTextBlockEntities],
//   (id, entities) => (id ? entities[id] : undefined),
// );
