// src/components/CommentForm.jsx
import { useState } from "react";

const CommentForm = ({ onSubmit, placeholder = "Write a comment..." }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        // Explicit background & text color so typed text is visible on all themes
        className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-indigo-200"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
      >
        {loading ? "..." : "Post"}
      </button>
    </form>
  );
};

export default CommentForm;
