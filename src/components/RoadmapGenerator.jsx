// src/components/RoadmapGenerator.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

const RoadmapGenerator = () => {
  const user = useSelector((s) => s.user);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/90 p-8 rounded-xl shadow max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Roadmap Generator (Premium)</h2>
          <p className="mb-6">Generate a tailored learning roadmap — available only for Premium members.</p>
          <a href="/premium" className="inline-block px-5 py-2 rounded bg-indigo-600 text-white">Upgrade</a>
        </div>
      </div>
    );
  }

  const generate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setRoadmap("");
    setError("");
    try {
      const res = await axios.post(
        `${BASE_URL}/premium/roadmap`,
        { goal: goal.trim(), level },
        { withCredentials: true, timeout: 40000 }
      );
      setRoadmap(res.data.roadmap || res.data.reply || "");
    } catch (err) {
      console.error("RoadmapGenerator error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-600 via-indigo-700 to-purple-700 text-white">
      <div className="max-w-3xl mx-auto bg-white/6 rounded-2xl p-4 shadow-lg">
        <h1 className="text-xl font-bold mb-4">Roadmap Generator</h1>

        <label className="block mb-1 font-semibold">Your goal</label>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="E.g. Become a MERN fullstack developer in 6 months"
          className="w-full p-3 rounded bg-white/20 mb-4 outline-none text-white"
        />

        <label className="block mb-1 font-semibold">Experience level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="p-2 rounded bg-white/20 mb-4">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <div className="flex gap-3">
          <button onClick={generate} disabled={loading} className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold disabled:opacity-60">
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
          <button onClick={() => { setGoal(""); setRoadmap(""); setError(""); }} className="px-4 py-2 bg-white/10 rounded">Clear</button>
        </div>

        {error && <div className="mt-4 text-red-300">{error}</div>}

        {roadmap && (
          <div className="mt-6 p-4 bg-black/30 rounded whitespace-pre-wrap break-words max-h-[50vh] overflow-auto">
            <h3 className="font-bold text-yellow-300 mb-2">Roadmap</h3>
            <pre className="whitespace-pre-wrap break-words text-sm">{roadmap}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;
