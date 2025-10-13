import { Outlet, useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { BASE_URL } from '../utils/constants';
import { useEffect } from 'react';


const Body = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const UserData= useSelector((store)=>store.user);

  const fetchUser = async () => {
    try{

      const res=await axios.get(BASE_URL + "/profile/view",{
        withCredentials:true,
      });
      dispatch(addUser(res.data));
    }catch(error){
      if(error.status === 401){
      navigate("/login");
      }
      console.error(error);
    }
  };

  useEffect(() => {
    if(!UserData){
    fetchUser();
    }
  }, []);
  return (
    <div>
        <NavBar />
        <Outlet />
        <Footer />
    </div>
  );
};

export default Body