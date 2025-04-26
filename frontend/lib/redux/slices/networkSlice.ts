import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Network } from "@/components/NetworkSelector";

interface NetworkState {
  selectedNetwork: Network | null;
}

const initialState: NetworkState = {
  selectedNetwork: null,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setNetwork(state, action: PayloadAction<Network>) {
      state.selectedNetwork = action.payload;
    },
  },
});

export const { setNetwork } = networkSlice.actions;
export default networkSlice.reducer;
