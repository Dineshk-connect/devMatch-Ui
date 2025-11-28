import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

// Import the three premium feature components (ensure these exist)
import PremiumChat from "./PremiumChat";
import CodeAnalyzer from "./CodeAnalyzer";
import RoadmapGenerator from "./RoadmapGenerator";

// If you prefer links instead of inline rendering, the component also renders links to the separate pages.

const Premium = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  // purchase state (existing)
  const [prompt, setPrompt] = useState(""); // not used for purchase but reserved
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // tab state for premium UI: "chat" | "analyzer" | "roadmap"
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    // if user becomes premium elsewhere, ensure we default to chat tab
    if (user?.isPremium) setActiveTab("chat");
  }, [user?.isPremium]);

  // --------------------------
  // RAZORPAY BUY HANDLER (unchanged logic)
  // --------------------------
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

          // Update client-side user store (this makes UI switch immediately)
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

  // --------------------------
  // If user is premium → show tabs + inline components
  // --------------------------
  if (user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 py-8 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Premium Tools</h1>
              <p className="text-sm text-white/80">Welcome to your premium toolkit — Chat, Code Analyzer & Roadmap Generator.</p>
            </div>

            <div className="flex gap-3">
              {/* direct links to separate pages (if user wants full-page view) */}
              <a href="/premium/chat" className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">Open Chat (new)</a>
              <a href="/premium/analyzer" className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">Open Analyzer</a>
              <a href="/premium/roadmap" className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">Open Roadmap</a>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/6 rounded-2xl p-4 shadow-lg">
            <div className="flex gap-3 mb-4">
              <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")}>💬 Chat</TabButton>
              <TabButton active={activeTab === "analyzer"} onClick={() => setActiveTab("analyzer")}>🧩 Code Analyzer</TabButton>
              <TabButton active={activeTab === "roadmap"} onClick={() => setActiveTab("roadmap")}>🛣️ Roadmap Generator</TabButton>
            </div>

            <div className="mt-4">
              {activeTab === "chat" && <PremiumChat />}
              {activeTab === "analyzer" && <CodeAnalyzer />}
              {activeTab === "roadmap" && <RoadmapGenerator />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // Default (not premium) — show purchase cards
  // --------------------------
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
            <li>🚫 No AI Tools</li>
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

// Small TabButton component
const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition ${
      active ? "bg-white/10 ring-2 ring-white/20" : "bg-transparent hover:bg-white/5"
    }`}
  >
    {children}
  </button>
);

export default Premium;
