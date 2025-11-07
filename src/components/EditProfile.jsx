import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { useDispatch } from "react-redux";
import axios from "axios";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [skills, setSkills] = useState(user.skills || "");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();

  // 🖼️ Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const res = await axios.post(`${BASE_URL}/profile/upload-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setPhotoUrl(res.data.imageUrl);
    } catch (err) {
      console.error(err);
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // 💾 Save profile changes
  const saveProfile = async () => {
    setError("");
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        { firstName, lastName, about, age, gender, photoUrl, skills },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setError(error.response?.data || "Error updating profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          ✏️ Edit Profile
        </h2>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={
                photoUrl ||
                "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png"
              }
              alt="Profile Preview"
              className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                <span className="loading loading-spinner loading-md text-indigo-600"></span>
              </div>
            )}
          </div>

          <label className="mt-4 cursor-pointer">
            <div className="btn btn-sm btn-outline btn-primary shadow-md">
              {isUploading ? "Uploading..." : "Change Photo"}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* First Name */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium text-gray-700">First Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* Last Name */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium text-gray-700">Last Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* About */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium text-gray-700">About</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            placeholder="Write something about yourself..."
            rows="3"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        {/* Age */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium text-gray-700">Age</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium text-gray-700">Gender</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Skills */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-medium text-gray-700">Skills</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        {/* Save Button */}
        <button
          className="btn btn-primary w-full text-white tracking-wide shadow-md hover:scale-105 transition"
          onClick={saveProfile}
          disabled={isUploading}
        >
          {isUploading ? "Please wait..." : "💾 Save Profile"}
        </button>

        {/* Success Toast */}
        {showToast && (
          <div className="toast toast-top toast-center">
            <div className="alert alert-success shadow-lg">
              <span>✅ Profile updated successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
