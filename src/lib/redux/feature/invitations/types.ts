import type { EntityId } from '@reduxjs/toolkit';
import type { InvitationType } from '../../../../domains/settings/model/types';

export interface InvitationsState {
  ids: EntityId[];
  entities: Record<string, InvitationType>;
  loading: boolean;
  selectedInvitationId: string | null;
}
