import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";

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

  if (!connections) {
    return <h1 className="text-center text-xl mt-10">No Connection</h1>;
  }

  if (connections.length === 0) {
    return (
      <div className="text-center mt-10">
        <h1 className="font-bold text-2xl">No Connections Found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-10 gap-4">
      <h1 className="font-bold text-2xl mb-4">Connections</h1>

      {connections.map((connection) => {
        const { _id,firstName, lastName, photoUrl, age, gender, about } = connection;

        return (
          <div
            key={_id} // if you have an id, use it
            className="flex items-center p-4 rounded-lg bg-base-300 w-1/2"
          >
            <img
              alt="profile"
              className="w-14 h-14 rounded-full object-cover"
              src={photoUrl}
            />
            <div className="ml-4">
              <h2 className="font-bold text-xl">
                {firstName} {lastName}
              </h2>
              {age && gender && (
                <p className="text-sm text-gray-500">
                  {age} • {gender}
                </p>
              )}
              <p className="text-sm mt-1">{about}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
