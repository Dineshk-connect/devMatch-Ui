import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";

const UserProfile = () => {
  const { userId } = useParams(); // For visiting others' profiles
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);


  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [posts, setPosts] = useState([]);

  // Determine which user to show: current user or visited profile
  const profileId = userId || currentUser?._id;

  useEffect(() => {
  if (currentUser && profileId) {
    fetchUserProfile();
    fetchUserPosts();
  }
}, [profileId, currentUser]);

  const fetchUserProfile = async () => {
    const res = await axios.get(`${BASE_URL}/user/${profileId}`, {
      withCredentials: true,
    });
    setProfile(res.data.user);
    setConnectionStatus(res.data.connectionStatus);
  };

  const fetchUserPosts = async () => {
    const res = await axios.get(`${BASE_URL}/api/posts?author=${profileId}`, {
      withCredentials: true,
    });
    setPosts(res.data.posts);
  };

  const handleConnect = async () => {
    const res = await axios.post(
      `${BASE_URL}/request/send/${profileId}`,
      {},
      { withCredentials: true }
    );
    if (res.data.success) {
      setConnectionStatus("pending");
    }
  };

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  const isOwnProfile = profileId === currentUser?._id;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Profile Banner */}
      <div className="rounded-lg shadow-lg overflow-hidden h-60 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-center relative">
        <img
          src={
            profile.photoUrl ||
            "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png"
          }
          alt="User Avatar"
          className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg mb-3"
        />
        <h2 className="text-2xl font-bold text-white drop-shadow">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-gray-200 text-sm mt-1 px-4">{profile.about}</p>

        {/* Buttons */}
        <div className="mt-4">
          {isOwnProfile ? (
            <button
              onClick={() => navigate("/edit-profile")}
              className="btn btn-outline btn-light btn-sm shadow-md hover:scale-105 transition"
            >
              ✏️ Edit Profile
            </button>
          ) : connectionStatus === "connected" ? (
            <span className="badge badge-success text-white py-3 px-4 text-sm shadow-md">
              ✅ Connected
            </span>
          ) : connectionStatus === "pending" ? (
            <button className="btn btn-disabled btn-sm">Request Sent</button>
          ) : (
            <button
              onClick={handleConnect}
              className="btn btn-primary btn-sm shadow-md hover:scale-105 transition"
            >
              Send Interest
            </button>
          )}
        </div>
      </div>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Skills</h3>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="badge badge-outline text-gray-700 border border-gray-300 px-3 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-6 text-gray-800">
          {isOwnProfile ? "Your Posts" : `${profile.firstName}'s Posts`}
        </h3>
        {posts.length ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <p className="text-gray-700 mb-2">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post Visual"
                  className="rounded-lg w-full max-h-80 object-cover mb-3 shadow-md"
                />
              )}
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline font-medium"
                >
                  {post.link}
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            {isOwnProfile
              ? "You haven’t posted anything yet."
              : `${profile.firstName} hasn’t posted anything yet.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
