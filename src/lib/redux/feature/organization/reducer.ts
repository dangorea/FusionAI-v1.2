import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrganizationBlockState } from './types';
import {
  createOrganizationThunk,
  deleteOrganizationThunk,
  fetchOrganizationBlocks,
  updateOrganizationThunk,
} from './thunk';
import { organizationAdapter } from './adapter';
import { ORGANIZATION_REDUCER_NAME } from '../../reducer-constant';
import type { OrganizationType } from '../../../../domains/organization/model/types';

const initialState: OrganizationBlockState =
  organizationAdapter.getInitialState({
    selectedOrganization: null,
  });

const organizationSlice = createSlice({
  name: ORGANIZATION_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedOrganization(
      state,
      action: PayloadAction<OrganizationType | null>,
    ) {
      state.selectedOrganization = action.payload
        ? (action.payload.id ?? null)
        : null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrganizationBlocks.fulfilled, (state, action) => {
      organizationAdapter.setAll(state, action.payload);
    });
    builder.addCase(createOrganizationThunk.fulfilled, (state, action) => {
      organizationAdapter.addOne(state, action.payload);
    });
    builder.addCase(updateOrganizationThunk.fulfilled, (state, action) => {
      organizationAdapter.upsertOne(state, action.payload);
    });
    builder.addCase(deleteOrganizationThunk.fulfilled, (state, action) => {
      organizationAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setSelectedOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
