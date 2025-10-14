import { useState } from "react";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { useDispatch } from "react-redux";
import axios from "axios";

const EditProfile = ({ user }) => {
  const [firstName, setfirstName] = useState(user.firstName);
  const [lastName, setlastName] = useState(user.lastName);
  const [photoUrl, setphotoUrl] = useState(user.photoUrl);
  const [age, setage] = useState(user.age);
  const [gender, setgender] = useState(user.gender);
  const [about, setabout] = useState(user.about);
  const [skills, setskills] = useState(user.skills);
  const [error, seterror] = useState("");
  const dispatch = useDispatch();
  const [showToast,setshowToast]=useState("");


  const saveProfile = async () => {
    seterror("");
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          about,
          age,
          gender,
          photoUrl,
          skills,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setshowToast(true);
      setTimeout(()=>{
        setshowToast(false);
      },3000);
    } catch (error) {
      seterror(error.response.data);
    }
  };

  return (
    <><div className="flex justify-center  my-10 max ">
        <div className="flex justify-center mx-10 ">
          <div className="card bg-base-300 w-96 shadow-xl">
            <div className="card-body">
            <h2 className="card-title justify-center">
              Edit Profile
            </h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">firstName</span>
              </label>
              <input
                type="text"
                placeholder="Enter your firstName"
                className="input input-bordered"
                value={firstName}
                onChange={(e) => setfirstName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">lastName</span>
              </label>
              <input
                type="text"
                placeholder="Enter your lastName"
                className="input input-bordered"
                value={lastName}
                onChange={(e) => setlastName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">photo</span>
              </label>
              <input
                type="text"
                placeholder="Paste your photo url"
                className="input input-bordered"
                value={photoUrl}
                onChange={(e) => setphotoUrl(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">about</span>
              </label>
              <input
                type="text"
                placeholder="Bio"
                className="input input-bordered"
                value={about}
                onChange={(e) => setabout(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">age</span>
              </label>
              <input
                type="number"
                placeholder="Enter your age"
                className="input input-bordered"
                value={age}
                onChange={(e) => setage(e.target.value)}
              />
            </div>
            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select
                className="select select-bordered"
                value={gender}
                onChange={(e) => setgender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">skills</span>
              </label>
              <input
                type="text"
                placeholder="Enter your skills"
                className="input input-bordered"
                value={skills}
                onChange={(e) => setskills(e.target.value)}
              />
            </div>
            {/* Submit Button */}
            <p className="text-red-500"></p>
            <div className="form-control mt-6">
              <button className="btn btn-primary w-full" onClick={saveProfile}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      <UserCard
        user={{ firstName, lastName, photoUrl, age, gender, about, skills }}
      />
    </div>
   {showToast && ( <div className="toast toast-top toast-center">
  <div className="alert alert-success">
    <span>Profile Updated successfully.</span>
  </div>
</div>
)};
    </>
  );
};

export default EditProfile;
