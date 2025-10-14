import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnection,removeConnection } from "../utils/connectionSlice";


const Connections = () => {

    const connections=useSelector((store)=>store.connection);
    const dispatch=useDispatch();

    const fetchConnections=async ()=>{
        try{
            const connections= await axios.get(BASE_URL + "/user/connections",{withCredentials:true});
            
            dispatch(addConnection(connections.data.data));
        }catch(err){
            console.log(err.message);
        }
    };

    useEffect(()=>{
        fetchConnections();
    },[]);

        if(!connections) return <h1>no conen</h1>;

        if(connections.length ==    0) return(  <><h1 className="text-bold text-2xl">No Connections Found</h1></> );
  return (
    <div className="flex justify-center my-10">
    <h1 className="text-bold text-2xl">Connections</h1>


    {connections.map((connection)=>{
       const {firstName, lastName, photoURL, age, gender, about}=connection;

        return (
          <div className="flex items-center m-2 p-2  rounded-lg bg-base-300 w-1/2 mx-auto">
            <div>
              <img
                alt="photo"
                className="w-14 h-14 rounded-full object-contain"
                src={photoURL}
              />
            </div>
            <div className="text-left m-4 p-4 ">
              <h2 className="font-bold text-xl">
                {firstName + " " + lastName}
              </h2>
              {age && gender && <p>{age + " " + gender}</p>}
              <p>{about}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;