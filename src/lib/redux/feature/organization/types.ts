import { EntityId } from '@reduxjs/toolkit';

export interface OrganizationBlockDataType {
  name: string;
  slug: string;
  description: string;
  _id?: string;
}

export interface OrganizationBlockState {
  // Normalized state shape
  ids: EntityId[];
  entities: Record<string, OrganizationBlockDataType>;
  // UI state: selected organization is stored as its slug
  selectedOrganization: string | null;
}
