import { createSlice } from '@reduxjs/toolkit';
import { TextBlockState } from './types';
import { fetchTextBlocks } from './thunk';
import { textBlocksAdapter } from './adapter';
import { TEXT_BLOCKS_REDUCER_NAME } from '../../reducer-constant';

const initialState: TextBlockState = textBlocksAdapter.getInitialState({});

const textBlocksSlice = createSlice({
  name: TEXT_BLOCKS_REDUCER_NAME,
  initialState,
  reducers: {
    addTextBlock: textBlocksAdapter.addOne,
    setTextBlocks: textBlocksAdapter.setAll,
    editTextBlock: textBlocksAdapter.upsertOne,
    deleteTextBlock: textBlocksAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTextBlocks.fulfilled, (state, action) => {
      textBlocksAdapter.setAll(state, action.payload);
    });
  },
});

export const { addTextBlock, setTextBlocks, editTextBlock, deleteTextBlock } =
  textBlocksSlice.actions;
export default textBlocksSlice.reducer;
