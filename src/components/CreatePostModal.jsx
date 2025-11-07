import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const CreatePostModal = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      alert("Post content is required!");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("link", link);
    formData.append("visibility", visibility);
    if (image) formData.append("image", image);

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      onPostCreated(res.data.post);
      document.getElementById("create_post_modal").close(); // Close the modal
      setContent(""); setLink(""); setVisibility("public"); setImage(null);  // Reset form
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className="btn btn-primary w-full mb-4"
        onClick={() => document.getElementById("create_post_modal").showModal()}
      >
        Create New Post
      </button>

      {/* Modal */}
      <dialog id="create_post_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create a New Post</h3>
          <form onSubmit={handlePostSubmit} className="space-y-3">

            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>

            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Optional link (e.g. GitHub)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />

            <input
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <select
              className="select select-bordered w-full"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
            </select>

            <div className="modal-action">
              <button
                type="submit"
                className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              >
                Post
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById("create_post_modal").close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default CreatePostModal;
