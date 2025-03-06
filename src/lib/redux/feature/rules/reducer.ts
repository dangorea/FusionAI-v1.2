import { createSlice } from '@reduxjs/toolkit';
import { RuleState } from './types';
import { fetchRules } from './thunk';
import { rulesAdapter } from './adapter';
import { RULES_REDUCER_NAME } from '../../reducer-constant';

const initialState: RuleState = rulesAdapter.getInitialState({});

const rulesSlice = createSlice({
  name: RULES_REDUCER_NAME,
  initialState,
  reducers: {
    addRule: rulesAdapter.addOne,
    setRule: rulesAdapter.setAll,
    editRule: rulesAdapter.upsertOne,
    deleteRule: rulesAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRules.fulfilled, (state, action) => {
      rulesAdapter.setAll(state, action.payload);
    });
  },
});

export const { addRule, setRule, editRule, deleteRule } = rulesSlice.actions;
export default rulesSlice.reducer;
