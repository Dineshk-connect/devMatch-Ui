// src/components/LikeButton.jsx
import React, { useState } from "react";

const LikeButton = ({ postId, isLiked, likesCount = 0, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onToggle(postId);
    } catch (err) {
      console.error("Like toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-medium ${
        isLiked ? "text-indigo-600" : "text-gray-600"
      } hover:opacity-90`}
      disabled={loading}
    >
      {isLiked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.656z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4 4 0 015.657 0L12 8.343l2.025-2.025a4 4 0 115.657 5.657L12 22.657 4.318 14.0a4 4 0 010-5.657z" />
        </svg>
      )}
      <span>{likesCount}</span>
    </button>
  );
};

export default LikeButton;
