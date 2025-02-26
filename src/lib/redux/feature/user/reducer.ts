import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrganizationManagementDataType, OrgManagementState } from './types';
import { fetchOrganizationManagements } from './thunk';
import { userAdapter } from './adapter';
import { USER_REDUCER_NAME } from '../../reducer-constant';

const initialState: OrgManagementState = userAdapter.getInitialState({
  selectedManagement: null,
});

const userSlice = createSlice({
  name: USER_REDUCER_NAME,
  initialState,
  reducers: {
    setSelectedManagement(
      state,
      action: PayloadAction<OrganizationManagementDataType | null>,
    ) {
      state.selectedManagement = action.payload ? action.payload.userId : null;
    },
    addOrganizationManagement: userAdapter.addOne,
    setOrganizationManagements: userAdapter.setAll,
    editOrganizationManagement: userAdapter.upsertOne,
    deleteOrganizationManagement: userAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrganizationManagements.fulfilled, (state, action) => {
      userAdapter.setAll(state, action.payload);
    });
  },
});

export const {
  setSelectedManagement,
  addOrganizationManagement,
  setOrganizationManagements,
  editOrganizationManagement,
  deleteOrganizationManagement,
} = userSlice.actions;

export default userSlice.reducer;
