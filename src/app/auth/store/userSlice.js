import { createSlice } from '@reduxjs/toolkit';
import { tokenService } from '../../services/tokenService';

const storedUser = tokenService.getUserFromToken();

const initialState = {
  data: storedUser,
  isAuthenticated: !!storedUser,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, { payload }) {
      state.data = payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.data = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;

export const selectUser = (state) => state.user.data;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserRole = (state) => state.user.data?.role ?? null;
export const selectUserPermissions = (state) => state.user.data?.permissions ?? [];

export default userSlice.reducer;
