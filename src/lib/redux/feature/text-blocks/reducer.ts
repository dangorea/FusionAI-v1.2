import { createSlice } from '@reduxjs/toolkit';
import { TextBlockCategory } from './types';
import type { TextBlockState } from './types';
import {
  createTextBlockThunk,
  deleteTextBlockThunk,
  fetchTextBlocks,
  updateTextBlockThunk,
} from './thunk';
import { TEXT_BLOCK_REDUCER_NAME } from '../../reducer-constant';
import { knowledgeAdapter, personalityAdapter } from './adapter';

const initialState: TextBlockState = {
  knowledge: knowledgeAdapter.getInitialState(),
  personality: personalityAdapter.getInitialState(),
};

const textBlockSlice = createSlice({
  name: TEXT_BLOCK_REDUCER_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTextBlocks.fulfilled, (state, action) => {
      const { blockType, blocks } = action.payload;
      if (blockType === TextBlockCategory.KNOWLEDGE) {
        knowledgeAdapter.setAll(state.knowledge, blocks);
      } else if (blockType === TextBlockCategory.PERSONALITY) {
        personalityAdapter.setAll(state.personality, blocks);
      }
    });

    builder.addCase(createTextBlockThunk.fulfilled, (state, action) => {
      const block = action.payload;
      if (block.type === TextBlockCategory.KNOWLEDGE) {
        knowledgeAdapter.addOne(state.knowledge, block);
      } else if (block.type === TextBlockCategory.PERSONALITY) {
        personalityAdapter.addOne(state.personality, block);
      }
    });

    builder.addCase(updateTextBlockThunk.fulfilled, (state, action) => {
      const block = action.payload;
      if (block.type === TextBlockCategory.KNOWLEDGE) {
        knowledgeAdapter.upsertOne(state.knowledge, block);
      } else if (block.type === TextBlockCategory.PERSONALITY) {
        personalityAdapter.upsertOne(state.personality, block);
      }
    });

    builder.addCase(deleteTextBlockThunk.fulfilled, (state, action) => {
      const id = action.payload;
      if (state.knowledge.entities[id]) {
        knowledgeAdapter.removeOne(state.knowledge, id);
      }
      if (state.personality.entities[id]) {
        personalityAdapter.removeOne(state.personality, id);
      }
    });
  },
});

export default textBlockSlice.reducer;
