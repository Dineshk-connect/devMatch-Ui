import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect, } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);

  const dispatch = useDispatch();

  const reviewRequest = async (status, _id)=>{
    try{
        const res= await axios.post(BASE_URL + "/request/review/" +status +"/" + _id,{},{withCredentials:true});

            dispatch(removeRequest(_id));
    }catch(err){
        console.log(err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/recieved", {
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

  if (!requests) {
    return <h1 className="text-center text-xl mt-10">No Requests</h1>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center mt-10">
        <h1 className="font-bold text-2xl flex justify-center my-10">No Requests Found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-10 gap-4">
      <h1 className="font-bold text-2xl mb-4">Requests</h1>

      {requests.map((request) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          request.fromUserId;

        return (
          <div
            key={_id} // if you have an id, use it
            className="flex justify-between items-center p-4 rounded-lg bg-base-300 w-2/3"
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
            <div>
              <button className="btn btn-primary mx-2" onClick={()=>reviewRequest("rejected", request._id)}>Reject</button>
              <button className="btn btn-secondary mx-2" onClick={()=>reviewRequest("accepted", request._id)}>Accept</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
