import { EntityId } from '@reduxjs/toolkit';

export interface OrganizationBlockDataType {
  name: string;
  slug: string;
  description: string;
  _id?: string;
}

export interface OrganizationBlockState {
  ids: EntityId[];
  entities: Record<string, OrganizationBlockDataType>;
  selectedOrganization: string | null;
}
