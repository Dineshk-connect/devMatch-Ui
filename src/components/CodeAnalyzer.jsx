// src/components/CodeAnalyzer.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

const CodeAnalyzer = () => {
  const user = useSelector((s) => s.user);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/90 p-8 rounded-xl shadow max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Code Analyzer (Premium)</h2>
          <p className="mb-6">This tool is available to Premium members only.</p>
          <a href="/premium" className="inline-block px-5 py-2 rounded bg-indigo-600 text-white">Upgrade</a>
        </div>
      </div>
    );
  }

  const analyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await axios.post(
        `${BASE_URL}/premium/analyze`,
        { code, language },
        { withCredentials: true, timeout: 40000 }
      );
      // Prefer `result` or `reply` whichever backend returns
      setResult(res.data.result || res.data.reply || "");
    } catch (err) {
      console.error("CodeAnalyzer error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      alert("Analysis copied to clipboard");
    } catch {
      alert("Unable to copy");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="max-w-4xl mx-auto bg-white/6 rounded-2xl p-4 shadow-lg">
        <h1 className="text-xl font-bold mb-4">Code Analyzer</h1>

        <div className="mb-3">
          <label className="block mb-1 font-semibold">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 rounded bg-white/20">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C/C++</option>
            <option value="go">Go</option>
            <option value="csharp">C#</option>
          </select>
        </div>

        <textarea
          rows={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste code here for analysis (linting, bugs, suggested fixes, explanation)"
          className="w-full rounded p-3 bg-white/20 placeholder-white/70 outline-none text-white font-mono"
        />

        <div className="flex gap-3 mt-4">
          <button onClick={analyze} disabled={loading} className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold disabled:opacity-60">
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
          <button onClick={() => { setCode(""); setResult(""); setError(""); }} className="px-4 py-2 bg-white/10 rounded">Clear</button>
          <button onClick={copyResult} className="px-4 py-2 bg-white/10 rounded">Copy Result</button>
        </div>

        {error && <div className="mt-4 text-red-300">{error}</div>}

        {result && (
          // result container: limit height, allow scroll, preserve whitespace and wrap long lines
          <div className="mt-6 p-4 bg-black/30 rounded whitespace-pre-wrap break-words max-h-[40vh] overflow-auto">
            <h3 className="font-bold text-yellow-300 mb-2">Analysis</h3>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalyzer;
