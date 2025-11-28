// src/components/PostsFeed.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts, addNewPost, toggleLike } from "../utils/postSlice";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";

const PostsFeed = () => {
  const dispatch = useDispatch();
  const { posts, status, error } = useSelector((state) => state.posts);
  const currentUser = useSelector((state) => state.user); // your user slice returns user object

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handlePostCreated = (newPost) => {
    dispatch(addNewPost(newPost));
  };

  const handleToggleLike = (postId) => {
    dispatch(toggleLike(postId));
  };

  if (status === "loading")
    return <p className="text-center text-gray-500 mt-4">Loading posts...</p>;

  if (status === "failed")
    return (
      <p className="text-center text-red-500 mt-4">
        Failed to load posts: {error}
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Create New Post Button and Modal */}
      <CreatePostModal onPostCreated={handlePostCreated} />

      {/* Render existing posts */}
      {posts.length === 0 ? (
        <p className="text-center text-black-500">No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-white p-4 shadow rounded-lg border border-gray-100"
          >
            <Link to={`/profile/${post.author._id}`}>
              <div className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-90 transition">
                <img
                  src={post.author.photoUrl}
                  alt={`${post.author.firstName}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-gray-800 font-semibold">
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>

            {/* Content */}
            <p className="text-gray-700 mb-3">{post.content}</p>

            {/* Optional link */}
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium underline mb-3 block"
              >
                {post.link}
              </a>
            )}

            {/* Optional image */}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post visual"
                className="rounded-lg w-full max-h-96 object-cover mt-3"
              />
            )}

            {/* Actions: Like & Comments */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LikeButton
                  postId={post._id}
                  isLiked={!!post.likedByCurrentUser}
                  likesCount={post.likesCount ?? (post.likes ? post.likes.length : 0)}
                  onToggle={() => handleToggleLike(post._id)}
                />
                <button
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  aria-expanded="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.22 0-2.39-.18-3.47-.5L3 20l1.5-4.03C3.78 14.91 3 13.53 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">
                    {post.commentsCount ?? (post.comments ? post.comments.length : 0)} Comments
                  </span>
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-3">
              <CommentList postId={post._id ?? post._id} currentUser={currentUser} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostsFeed;
