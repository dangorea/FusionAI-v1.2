import { EntityId } from '@reduxjs/toolkit';
import { OrganizationType } from '../../../../domains/organization/model/types';

export interface OrganizationBlockState {
  ids: EntityId[];
  entities: Record<string, OrganizationType>;
  selectedOrganization: string | null;
}
