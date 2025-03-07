import type { RootState } from '../../store';
import { rulesAdapter } from './adapter';

const selectRulesState = (state: RootState) => state.rules;

export const {
  selectAll: selectAllRules,
  selectById: selectRuleById,
  selectEntities: selectRuleEntities,
  selectIds: selectRuleIds,
  selectTotal: selectRuleTotal,
} = rulesAdapter.getSelectors<RootState>(selectRulesState);
