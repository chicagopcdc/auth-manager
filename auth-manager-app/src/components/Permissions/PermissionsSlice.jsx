import { createSlice } from '@reduxjs/toolkit';
import { fetchTotalPermissions, fetchUserInfo } from './PermissionsThunks';

const PermissionsSlice = createSlice({
  name: 'permissions',
  initialState: {
    totalPermissions: [],
    firstList: ['Item 1', 'Item 2', 'Item 3'],
    secondList: ['Item a', 'Item b', 'Item c'],
    selected: { firstList: [], secondList: [] },
    userInfo: {},
    permissionsStatus: 'idle',
    userInfoStatus: 'idle'
  },
  reducers: {
    // TODO: use dispatch to call reducers in Transfer List

    transferToSecond(state, action) {
      state.selected = {
        firstList: [],
        secondList: [...state.selected.secondList]
      };
      state.firstList = state.firstList.filter(
        (item) => !selected.firstList.includes(item)
      );
      state.secondList = [...state.secondList, ...state.selected.firstList];
    },

    transferToFirst(state, action) {
      state.secondList = state.secondList.filter(
        (item) => !selected.secondList.includes(item)
      );
      state.firstList = [...state.firstList, ...state.selected.secondList];
      state.selected = {
        firstList: [...state.selected.firstList],
        secondList: []
      };
    },

    handleItemSelected(state, action) {
      if (state.secondList.includes(action.itemName)) {
        state.selected = {
          ...state.selected,
          secondList: state.selected.secondList.filter(
            (s) => s !== action.itemName
          )
        };
      } else if (state.selected.firstList.includes(itemName)) {
        state.selected = {
          ...state.selected,
          firstList: prev.firstList.filter((s) => s !== itemName)
        };
      } else {
        state.selected = {
          ...state.selected,
          [action.listStr]: [...state.selected[listStr], itemName]
        };
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalPermissions.pending, (state) => {
        state.permissionsStatus = 'loading';
      })
      .addCase(fetchTotalPermissions.rejected, (state) => {
        state.permissionsStatus = 'failed';
      })
      .addCase(fetchTotalPermissions.fulfilled, (state, action) => {
        state.permissionsStatus = 'success';
        state.totalPermissions = action.payload;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.userInfoStatus = 'loading';
      })
      .addCase(fetchUserInfo.rejected, (state) => {
        state.userInfoStatus = 'failed';
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userInfoStatus = 'success';
        state.userInfo = action.payload;
      });
  }
});

export default PermissionsSlice.reducer;
export const permissionsActions = PermissionsSlice.actions;
