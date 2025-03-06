import { EntityId } from '@reduxjs/toolkit';

export interface RuleType {
  id: string;
  title: string;
  details: string;
  organization?: string;
}

export interface RuleState {
  ids: EntityId[];
  entities: Record<string, RuleType>;
}
