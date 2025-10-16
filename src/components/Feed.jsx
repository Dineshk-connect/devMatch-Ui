import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
   
  const dispatch = useDispatch();

  const getFeed = async () => {
    //if (feed) return;
     if (Array.isArray(feed) && feed.length > 0) return;
    try {
      const res = await axios.get(BASE_URL + "/feed",{withCredentials:true,});
      dispatch(addFeed(res?.data?.data));
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getFeed();  
  }, []);

  //if(feed.length <= 0) return<h1 className="flex justify-center my-10">No new Users Founds</h1>;
   if (!Array.isArray(feed) || feed.length === 0) {
   return <h1 className="flex justify-center my-10">No new users found</h1>;
  }
  return feed && (
  <div className="flex justify-center m-10">
    <UserCard user={feed[0]}/>
  </div>
  );
};

export default Feed;
