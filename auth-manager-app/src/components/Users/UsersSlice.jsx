import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers } from './UsersThunk';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    status: 'idle',
    clickedUser: {}
  },
  reducers: {
    /**
     * sets state.clickedUser, which will contain properties: username, first_name,
     *  last_name, institution, and will be used in Permissions.jsx
     */
    setClickedUser(state, action) {
      state.clickedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'success';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = 'failed';
      });
  }
});
export const usersSliceActions = usersSlice.actions;
export default usersSlice.reducer;
