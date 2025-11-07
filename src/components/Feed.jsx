import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import PostsFeed from "./PostsFeed";
import { motion, AnimatePresence } from "framer-motion"; // ✅ added

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [view, setView] = useState("developers"); // "developers" or "posts"

  // 🧠 Fetch Developer Feed
  const getFeed = async () => {
    if (Array.isArray(feed) && feed.length > 0) return;
    try {
      const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
      dispatch(addFeed(res?.data?.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6 bg-white rounded-t-lg shadow-sm">
        <button
          onClick={() => setView("developers")}
          className={`flex-1 py-3 text-center text-lg transition ${
            view === "developers"
              ? "border-b-4 border-indigo-500 font-semibold text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          👩‍💻 Developers
        </button>
        <button
          onClick={() => setView("posts")}
          className={`flex-1 py-3 text-center text-lg transition ${
            view === "posts"
              ? "border-b-4 border-indigo-500 font-semibold text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📰 Posts
        </button>
      </div>

      {/* Developers View */}
      {view === "developers" && (
        <div className="flex justify-center my-10 relative">
          <AnimatePresence mode="wait">
            {Array.isArray(feed) && feed.length > 0 ? (
              <motion.div
                key={feed[0]._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.35 }}
              >
                <UserCard user={feed[0]} type="feed" />
              </motion.div>
            ) : (
              <motion.div
                key="no-users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 text-gray-600"
              >
                <h1 className="text-xl font-semibold mb-2">
                  No new developers found 😕
                </h1>
                <p className="text-sm">Check back later for more recommendations!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Posts View */}
      {view === "posts" && (
        <motion.div
          key="posts-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4"
        >
          <PostsFeed />
        </motion.div>
      )}
    </div>
  );
};

export default Feed;
