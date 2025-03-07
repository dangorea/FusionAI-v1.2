import type { EntityId } from '@reduxjs/toolkit';
import type { OrganizationType } from '../../../../domains/organization/model/types';

export interface OrganizationBlockState {
  ids: EntityId[];
  entities: Record<string, OrganizationType>;
  selectedOrganization: string | null;
}
