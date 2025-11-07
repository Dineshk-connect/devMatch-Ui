import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPosts, createPost } from "./postAPI";

// Fetch all posts
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkAPI) => {
    try {
      const response = await getPosts();
      return response.data.posts;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching posts"
      );
    }
  }
);

// Create new post
export const makePost = createAsyncThunk(
  "posts/makePost",
  async (formData, thunkAPI) => {
    try {
      const response = await createPost(formData);
      return response.data.post;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating post"
      );
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addNewPost: (state, action) => {
      // manual update for immediate UI feedback
      state.posts.unshift(action.payload);
    },
    clearPosts: (state) => {
      state.posts = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts cases
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create post case
      .addCase(makePost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // Adds new post to top of feed
      })
      .addCase(makePost.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addNewPost, clearPosts } = postSlice.actions;

export default postSlice.reducer;
