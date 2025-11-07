import axios from "axios";
import { BASE_URL } from "./constants";

const API = axios.create({
  baseURL: BASE_URL,  // should be "http://localhost:3000"
  withCredentials: true,
});

export const getPosts = () => API.get("/api/posts");
export const createPost = (formData) =>
  API.post("/api/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
