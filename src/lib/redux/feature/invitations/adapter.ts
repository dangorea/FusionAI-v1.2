import type { EntityId } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { InvitationType } from '../../../../domains/settings/model/types';

export const invitationsAdapter = createEntityAdapter<InvitationType, EntityId>(
  {
    selectId: (inv) => inv.id,
  },
);
