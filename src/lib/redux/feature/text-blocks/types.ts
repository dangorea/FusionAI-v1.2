import { EntityId } from '@reduxjs/toolkit';

export interface TextBlockDataType {
  id: string;
  title: string;
  details: string;
  organization?: string;
}

export interface TextBlockState {
  // Normalized state shape
  ids: EntityId[];
  entities: Record<string, TextBlockDataType>;
}
