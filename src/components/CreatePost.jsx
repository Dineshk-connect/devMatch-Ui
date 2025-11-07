import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return alert("Post content is required!");

    const formData = new FormData();
    formData.append("content", content);
    formData.append("link", link);
    formData.append("visibility", visibility);
    if (image) formData.append("image", image);

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      onPostCreated(res?.data?.post); // callback to notify parent
      setContent("");
      setLink("");
      setVisibility("public");
      setImage(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Create a Post</h3>
      <form onSubmit={handleSubmit} className="space-y-4">

        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Optional link (e.g. GitHub or portfolio)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <select
          className="select select-bordered w-full"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="connections">Connections only</option>
        </select>

        <button
          type="submit"
          className={`btn btn-primary w-full ${isSubmitting ? "loading" : ""}`}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
