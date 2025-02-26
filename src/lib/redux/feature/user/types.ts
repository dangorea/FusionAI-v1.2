import { EntityId } from '@reduxjs/toolkit';

export interface OrganizationManagementDataType {
  userId: string;
  roles: string[];
}

export interface OrgManagementState {
  // Normalized state shape
  ids: EntityId[];
  entities: Record<string, OrganizationManagementDataType>;
  // UI state: selected management stored as userId
  selectedManagement: string | null;
}
