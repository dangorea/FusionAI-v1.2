import type { EntityState, EntityId } from '@reduxjs/toolkit';

export enum TextBlockCategory {
  KNOWLEDGE = 'knowledge',
  PERSONALITY = 'personality',
}

export interface TextBlockType {
  id: string;
  name: string;
  content: string;
  orgId?: string;
  type: TextBlockCategory;
  projectId?: string;
}

export interface TextBlockState {
  knowledge: EntityState<TextBlockType, EntityId>;
  personality: EntityState<TextBlockType, EntityId>;
}