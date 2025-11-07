import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const Premium = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const handleBuyClick = async (type) => {
    try {
      // 1️⃣ Create order
      const orderRes = await axios.post(
        `${BASE_URL}/payment/create`,
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = orderRes.data;

      // 2️⃣ Configure Razorpay
      const options = {
        key: keyId,
        amount,
        currency,
        name: "DevComrades",
        description: `Premium ${type} Membership`,
        order_id: orderId,
        prefill: {
          name: `${notes.firstName} ${notes.lastName}`,
          email: notes.email,
          contact: "9999999999",
        },
        theme: {
          color: type === "Gold" ? "#FFD700" : "#C0C0C0",
        },
        handler: async function (response) {
          // 3️⃣ Update backend after successful payment
          await axios.post(
            `${BASE_URL}/payment/success`,
            {
              orderId,
              paymentId: response.razorpay_payment_id,
            },
            { withCredentials: true }
          );

          dispatch(addUser({ ...user, isPremium: true }));
          alert(`🎉 Payment successful! You are now a ${type} Member.`);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    }
  };

  // 🧩 Already Premium
  if (user?.isPremium) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
        <h1 className="text-4xl font-bold">
          ✅ You’re already a <span className="text-yellow-300">Premium Member!</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 py-12 px-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 drop-shadow-lg text-center">
        Upgrade to Premium Membership ✨
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
        {/* Silver Plan */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-t-4 border-gray-400">
          <h2 className="text-3xl font-bold text-gray-700 mb-2">🥈 Silver Membership</h2>
          <p className="text-gray-500 mb-4">Perfect for learners and new developers</p>

          <div className="text-4xl font-extrabold text-indigo-600 mb-6">₹300 / month</div>

          <ul className="text-gray-700 text-left mb-6 space-y-2">
            <li>✅ Access to all public DevComrades profiles</li>
            <li>✅ Send up to 20 connection requests/day</li>
            <li>✅ Basic AI assistance on posts</li>
            <li>🚫 No ad-free experience</li>
          </ul>

          <button
            onClick={() => handleBuyClick("Silver")}
            className="btn btn-outline btn-primary w-full text-lg font-semibold hover:scale-105 transition"
          >
            Buy Silver
          </button>
        </div>

        {/* Gold Plan */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-t-4 border-yellow-400">
          <h2 className="text-3xl font-bold text-gray-700 mb-2">🏆 Gold Membership</h2>
          <p className="text-gray-500 mb-4">For serious developers and professionals</p>

          <div className="text-4xl font-extrabold text-yellow-500 mb-6">₹700 / month</div>

          <ul className="text-gray-700 text-left mb-6 space-y-2">
            <li>🌟 All Silver benefits</li>
            <li>🚀 Unlimited connection requests</li>
            <li>💬 Access to Premium Chat AI</li>
            <li>🎯 Highlighted profile visibility</li>
            <li>🎨 Ad-free & priority support</li>
          </ul>

          <button
            onClick={() => handleBuyClick("Gold")}
            className="btn btn-warning w-full text-lg font-semibold text-white hover:scale-105 transition"
          >
            Buy Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
