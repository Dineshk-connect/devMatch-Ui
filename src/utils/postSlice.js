// src/utils/postSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPosts, createPost, toggleLikeAPI, fetchCommentsAPI, addCommentAPI } from "./postAPI";

// Fetch all posts
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkAPI) => {
    try {
      const response = await getPosts();
      return response.data.posts;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error fetching posts");
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
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error creating post");
    }
  }
);

// Toggle like thunk
export const toggleLike = createAsyncThunk("posts/toggleLike", async (postId, thunkAPI) => {
  try {
    const res = await toggleLikeAPI(postId);
    // expected { postId, likesCount, likedByCurrentUser }
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Error toggling like");
  }
});

// Fetch comments thunk
export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async ({ postId, page = 1, limit = 5 }, thunkAPI) => {
    try {
      const res = await fetchCommentsAPI({ postId, page, limit });
      // expect: { comments: [...], page, limit, total }
      return { postId, ...res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Error fetching comments");
    }
  }
);

// Add comment thunk
export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, thunkAPI) => {
    try {
      const res = await addCommentAPI({ postId, text });
      // expect created comment object
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Error adding comment");
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
      // fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        // normalize minimal counts
        state.posts = action.payload.map((p) => ({
          ...p,
          likesCount: p.likesCount ?? (p.likes ? p.likes.length : 0),
          likedByCurrentUser: p.likedByCurrentUser ?? false,
          commentsCount: p.commentsCount ?? (p.comments ? p.comments.length : 0),
        }));
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // makePost
      .addCase(makePost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(makePost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likesCount, likedByCurrentUser } = action.payload;
        const idx = state.posts.findIndex((p) => p._id === postId);
        if (idx >= 0) {
          state.posts[idx].likesCount = likesCount;
          state.posts[idx].likedByCurrentUser = likedByCurrentUser;
        }
      })

      // fetchComments
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, page, limit, total } = action.payload;
        const idx = state.posts.findIndex((p) => p._id === postId);
        if (idx >= 0) {
          state.posts[idx].comments = comments;
          state.posts[idx].commentsCount = total ?? comments.length;
        }
      })

      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        // if your backend returns only the comment, comment should include postId or you may need to adjust
        // We expect backend returns created comment object and possibly postId. If backend returns { postId, comment }, adjust accordingly.
        const postId = comment.postId ?? comment.post?._id ?? null;
        if (!postId) {
          // fallback: try to find post by comment.post in comment object
          return;
        }
        const idx = state.posts.findIndex((p) => p._id === postId);
        if (idx >= 0) {
          state.posts[idx].comments = state.posts[idx].comments || [];
          state.posts[idx].comments.unshift(comment);
          state.posts[idx].commentsCount = (state.posts[idx].commentsCount || 0) + 1;
        }
      });
  },
});

export const { addNewPost, clearPosts } = postSlice.actions;

export default postSlice.reducer;
