import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { OrganizationBlockState } from './types';
import { fetchOrganizationBlocks } from './thunk';
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
        ? (action.payload._id ?? null)
        : null;
    },
    addOrganizationBlock: organizationAdapter.addOne,
    setOrganizationBlocks: organizationAdapter.setAll,
    editOrganizationBlock: organizationAdapter.upsertOne,
    deleteOrganizationBlock: organizationAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrganizationBlocks.fulfilled, (state, action) => {
      organizationAdapter.setAll(state, action.payload);
    });
  },
});

export const {
  setSelectedOrganization,
  addOrganizationBlock,
  setOrganizationBlocks,
  editOrganizationBlock,
  deleteOrganizationBlock,
} = organizationSlice.actions;

export default organizationSlice.reducer;
