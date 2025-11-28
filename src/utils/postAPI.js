// src/utils/postAPI.js
import axios from "axios";
import { BASE_URL } from "./constants";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const getPosts = () => API.get("/api/posts");
export const createPost = (formData) =>
  API.post("/api/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// New endpoints for likes & comments
export const toggleLikeAPI = (postId) =>
  API.put(`/api/posts/${postId}/like`);

export const fetchCommentsAPI = ({ postId, page = 1, limit = 5 }) =>
  API.get(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`);

export const addCommentAPI = ({ postId, text }) =>
  API.post(`/api/posts/${postId}/comments`, { text });
