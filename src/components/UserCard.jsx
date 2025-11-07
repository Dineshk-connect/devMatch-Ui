import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { Link } from "react-router-dom";

const UserCard = ({ user, type = "feed", onAccept, onReject }) => {
  const dispatch = useDispatch();

  const { _id, firstName, lastName, about, age, gender, photoUrl } = user;

  // --- Send request (Feed Page) ---
  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );

      // ✅ Always remove card immediately after click (not waiting for success flag)
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      if (err.response?.status === 400) {
        console.log("Request already exists, skipping user...");
      } else {
        console.log(err.message);
      }
      // ✅ Still remove even if backend says duplicate
      dispatch(removeUserFromFeed(userId));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 flex flex-col items-center text-center border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
      {/* Profile Photo */}
      <img
        src={
          photoUrl ||
          "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png"
        }
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-400 shadow-md mb-4"
      />

      {/* User Info */}
      <h2 className="text-lg font-semibold text-gray-800">
        {firstName} {lastName}
      </h2>

      {age && gender && (
        <p className="text-sm text-gray-500 mt-1">
          {age} • {gender}
        </p>
      )}

      <p className="text-sm text-gray-600 mt-2 px-2 line-clamp-3">
        {about || "No bio available"}
      </p>

      {/* Action Buttons */}
      {type === "feed" && (
        <div className="flex gap-3 mt-5">
          <button
            className="btn btn-sm bg-gradient-to-r from-gray-400 to-gray-600 text-white border-none shadow-md hover:scale-105 transition"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            👎 Ignore
          </button>
          <button
            className="btn btn-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-none shadow-md hover:scale-105 transition"
            onClick={() => handleSendRequest("interested", _id)}
          >
            💖 Interested
          </button>
        </div>
      )}

      {type === "connection" && (
        <div className="flex gap-3 mt-5">
          <Link to={`/profile/${_id}`}>
            <button className="btn btn-outline btn-sm border-gray-300 hover:bg-indigo-100 text-gray-700 font-medium">
              View Profile
            </button>
          </Link>
          <Link to={`/chat/${_id}`}>
            <button className="btn btn-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium border-none shadow-md hover:scale-105 transition">
              Chat 💬
            </button>
          </Link>
        </div>
      )}

      {type === "request" && (
        <div className="flex gap-3 mt-5">
          <button
            onClick={onReject}
            className="btn btn-sm bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium border-none shadow-md hover:scale-105 transition"
          >
            ❌ Reject
          </button>
          <button
            onClick={onAccept}
            className="btn btn-sm bg-gradient-to-r from-green-400 to-emerald-600 text-white font-medium border-none shadow-md hover:scale-105 transition"
          >
            ✅ Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;
