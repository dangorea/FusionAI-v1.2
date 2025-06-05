import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
  OrganizationManagementDataType,
  OrgManagementState,
} from './types';
import { fetchOrganizationManagements } from './thunk';
import { organizationManagementAdapter } from './adapter';
import { USER_REDUCER_NAME } from '../../reducer-constant';

const initialState: OrgManagementState =
  organizationManagementAdapter.getInitialState({
    selectedManagement: null,
  });

const orgManagementSlice = createSlice({
  name: USER_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedManagement(
      state,
      action: PayloadAction<OrganizationManagementDataType | null>,
    ) {
      state.selectedManagement = action.payload ? action.payload.email : null;
    },
    addOrganizationManagement: organizationManagementAdapter.addOne,
    setOrganizationManagements: organizationManagementAdapter.setAll,
    editOrganizationManagement: organizationManagementAdapter.upsertOne,
    deleteOrganizationManagement: organizationManagementAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrganizationManagements.fulfilled, (state, action) => {
      organizationManagementAdapter.setAll(state, action.payload);
    });
  },
});

export const {
  setSelectedManagement,
  addOrganizationManagement,
  setOrganizationManagements,
  editOrganizationManagement,
  deleteOrganizationManagement,
} = orgManagementSlice.actions;

export default orgManagementSlice.reducer;
