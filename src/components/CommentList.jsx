// src/components/CommentList.jsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchComments, addComment } from "../utils/postSlice";
import CommentForm from "./CommentForm";

const CommentList = ({ postId, currentUser }) => {
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const limit = 5;

  useEffect(() => {
    if (visible) loadComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, postId]);

  const loadComments = async (p = 1) => {
    setLoading(true);
    try {
      const res = await dispatch(fetchComments({ postId, page: p, limit })).unwrap();
      // res: { comments, page, limit, total }
      setComments((prev) => (p === 1 ? res.comments : [...prev, ...res.comments]));
      setPage(res.page);
      setTotal(res.total ?? res.comments.length);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (text) => {
    try {
      const outcome = await dispatch(addComment({ postId, text })).unwrap();
      // outcome: created comment
      setComments((prev) => [outcome, ...prev]);
      setTotal((t) => t + 1);
    } catch (err) {
      console.error("Add comment failed", err);
    }
  };

  return (
    <div>
      <button
        onClick={() => setVisible((v) => !v)}
        className="text-sm text-gray-600 mb-2 hover:underline"
      >
        {visible ? "Hide comments" : `View comments (${total})`}
      </button>

      {visible && (
        <div className="space-y-3">
          <CommentForm onSubmit={handleAddComment} />

          {loading && comments.length === 0 ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Be the first.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c._id} className="text-sm border-l pl-3 py-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-800">
                        {c.author?.firstName} {c.author?.lastName}
                      </div>
                      <div className="text-gray-700">{c.text}</div>
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    {/* future: edit/delete for owner */}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {comments.length < total && (
            <button
              onClick={() => loadComments(page + 1)}
              className="text-sm text-gray-600 hover:underline"
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentList;
