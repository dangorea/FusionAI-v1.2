import { EntityId } from '@reduxjs/toolkit';

export interface OrganizationManagementDataType {
  userId: string;
  roles: string[];
}

export interface OrgManagementState {
  ids: EntityId[];
  entities: Record<string, OrganizationManagementDataType>;
  selectedManagement: string | null;
}
