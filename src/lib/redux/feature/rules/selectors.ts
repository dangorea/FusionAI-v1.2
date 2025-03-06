import { RootState } from '../../store';
import { rulesAdapter } from './adapter';

const selectRulesState = (state: RootState) => state.rules;

export const {
  selectAll: selectAllRules,
  selectById: selectRuleById,
  selectEntities: selectRuleEntities,
  selectIds: selectRuleIds,
  selectTotal: selectRuleTotal,
} = rulesAdapter.getSelectors<RootState>(selectRulesState);

//
// export const selectSelectedTextBlockId = createSelector(
//   selectRulesState,
//   (state) => state.selectedTextBlockId,
// );
//
// export const selectSelectedTextBlock = createSelector(
//   [selectSelectedTextBlockId, selectTextBlockEntities],
//   (id, entities) => (id ? entities[id] : undefined),
// );
