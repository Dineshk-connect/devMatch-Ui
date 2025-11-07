import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import UserCard from "./UserCard"; // ✅ import shared card

const Connections = () => {
  const connections = useSelector((store) => store.connection);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnection(res.data.data));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
        <h1 className="font-bold text-3xl mb-4 drop-shadow-lg">No Connections Found 😕</h1>
        <p className="text-lg opacity-90">
          Start connecting with other developers to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 py-10 px-6">
      <h1 className="text-center text-white text-4xl font-bold mb-10 drop-shadow-lg">
        Your Connections
      </h1>

      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <UserCard key={connection._id} user={connection} type="connection" />
        ))}
      </div>
    </div>
  );
};

export default Connections;
