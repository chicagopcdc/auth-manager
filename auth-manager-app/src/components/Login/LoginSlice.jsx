import { createSlice } from '@reduxjs/toolkit';

const loginSlice = createSlice({
  name: 'login',
  initialState: { authKey: '', envir: '' },
  reducers: {
    setAuth(state, action) {
      state.authKey = action.payload;
    },
    setEnvir(state, action) {
      state.envir = action.payload;
    }
  }
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer;
