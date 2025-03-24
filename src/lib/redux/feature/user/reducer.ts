import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserState } from './types';
import { fetchUser } from './thunk';

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      },
    );
    builder.addCase(fetchUser.rejected, (state) => {
      // Handle errors as needed, e.g., clear user state or show an error message
      state.user = null;
    });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
