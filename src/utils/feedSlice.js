import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: [], // ✅ start as array, not null
  reducers: {
    addFeed: (state, action) => {
      return action.payload || []; // ✅ prevent null assignment
    },
    removeUserFromFeed: (state, action) => {
      const userId = action.payload;
      // ✅ return a new filtered array to trigger re-render
      return state.filter((user) => user._id !== userId);
    },
  },
});

export const { addFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
