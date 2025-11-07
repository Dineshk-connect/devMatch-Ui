import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";
import UserCard from "./UserCard"; // ✅ import shared card

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(`${BASE_URL}/request/review/${status}/${_id}`, {}, { withCredentials: true });
      dispatch(removeRequest(_id));
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/recieved`, {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
        <h1 className="text-3xl font-bold drop-shadow-lg mb-2">No Requests Found</h1>
        <p className="text-lg opacity-90">You don’t have any new connection requests right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 py-10 px-6">
      <h1 className="text-center text-white text-4xl font-bold mb-10 drop-shadow-lg">
        Connection Requests
      </h1>

      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <UserCard
            key={request._id}
            user={request.fromUserId}
            type="request"
            onAccept={() => reviewRequest("accepted", request._id)}
            onReject={() => reviewRequest("rejected", request._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Requests;
