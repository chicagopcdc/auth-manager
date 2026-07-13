import { createSlice } from '@reduxjs/toolkit';
import { fetchClients } from './ClientsThunk';

const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    status: 'idle',
    clickedClient: {}
  },
  reducers: {
    setClickedClient(state, action) {
      state.clickedClient = action.payload;
    },
    setClientPolicies(state, action) {
      const { clientID, policies } = action.payload;

      state.clients = state.clients.map((client) =>
        client.clientID === clientID
          ? { ...client, policies }
          : client
      );

      if (state.clickedClient.clientID === clientID) {
        state.clickedClient = {
          ...state.clickedClient,
          policies
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'success';
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const clientsSliceActions = clientsSlice.actions;
export default clientsSlice.reducer;
