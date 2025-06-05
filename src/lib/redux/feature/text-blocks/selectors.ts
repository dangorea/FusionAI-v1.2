import type { RootState } from '../../store';
import type { TextBlockType } from './types';
import { knowledgeAdapter, personalityAdapter } from './adapter';

const selectTextBlockState = (state: RootState) => state.textBlock;

export const {
  selectAll: selectAllKnowledgeTextBlocks,
  selectById: selectKnowledgeTextBlockById,
} = knowledgeAdapter.getSelectors(
  (state: RootState) => selectTextBlockState(state).knowledge,
);

export const {
  selectAll: selectAllPersonalityTextBlocks,
  selectById: selectPersonalityTextBlockById,
} = personalityAdapter.getSelectors(
  (state: RootState) => selectTextBlockState(state).personality,
);

export const selectTextBlockById =
  (id: string) =>
  (state: RootState): TextBlockType | undefined =>
    selectKnowledgeTextBlockById(state, id) ||
    selectPersonalityTextBlockById(state, id);
