import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts, addNewPost } from "../utils/postSlice";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";

const PostsFeed = () => {
  const dispatch = useDispatch();
  const { posts, status, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handlePostCreated = (newPost) => {
    dispatch(addNewPost(newPost));
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
        <p className="text-center text-gray-500">
          No posts yet. Be the first to post!
        </p>
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
          </div>
        ))
      )}
    </div>
  );
};

export default PostsFeed;
