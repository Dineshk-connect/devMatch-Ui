// src/components/PremiumChat.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

const PremiumChat = () => {
  const user = useSelector((s) => s.user);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // chat object
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (user?.isPremium) fetchConversations();
  }, [user?.isPremium]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeChat?.messages]);

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/90 p-8 rounded-xl shadow max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Premium AI Chat</h2>
          <p className="mb-6">This feature is available only for Premium members.</p>
          <a href="/premium" className="inline-block px-5 py-2 rounded bg-indigo-600 text-white">Upgrade to Premium</a>
        </div>
      </div>
    );
  }

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/premium/conversations`, { withCredentials: true });
      setConversations(res.data.conversations || []);
      // auto-select first conversation if exists
      if (res.data.conversations && res.data.conversations.length > 0) {
        loadConversation(res.data.conversations[0]._id);
      } else {
        setActiveChat(null);
      }
    } catch (err) {
      console.error("fetchConversations error:", err);
    }
  };

  const loadConversation = async (chatId) => {
    try {
      const res = await axios.get(`${BASE_URL}/premium/conversations/${chatId}`, { withCredentials: true });
      setActiveChat(res.data.chat);
    } catch (err) {
      console.error("loadConversation error:", err);
    }
  };

  const createAndSend = async (text) => {
    if (!text.trim()) return;
    setError("");
    setLoading(true);
    try {
      // call /premium/ask without chatId to create new conversation
      const res = await axios.post(
        `${BASE_URL}/premium/ask`,
        { prompt: text },
        { withCredentials: true, timeout: 30000 }
      );

      // res.data => { reply, chatId }
      const { reply, chatId } = res.data;
      // reload conversations and load this chat
      await fetchConversations();
      if (chatId) await loadConversation(chatId);
      setPrompt("");
    } catch (err) {
      console.error("createAndSend error:", err);
      setError("Failed to get AI reply");
    } finally {
      setLoading(false);
    }
  };

  const sendToActive = async (text) => {
    if (!text.trim() || !activeChat) return;
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/premium/ask`,
        { prompt: text, chatId: activeChat._id },
        { withCredentials: true, timeout: 30000 }
      );
      const { reply, chatId } = res.data;
      // reload the active chat
      await loadConversation(chatId || activeChat._id);
      setPrompt("");
    } catch (err) {
      console.error("sendToActive error:", err);
      setError("Failed to get AI reply");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!activeChat) {
      createAndSend(prompt);
    } else {
      sendToActive(prompt);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
        {/* Conversations list */}
        <div className="col-span-1 bg-white/6 rounded-2xl p-4 max-h-[70vh] overflow-auto">
          <h3 className="font-bold mb-3">Conversations</h3>
          <button
            onClick={fetchConversations}
            className="text-sm mb-3 px-3 py-1 bg-white/10 rounded"
          >
            Refresh
          </button>

          {conversations.length === 0 && <div className="text-white/70">No conversations yet — ask something to create one.</div>}
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li
                key={c._id}
                onClick={() => loadConversation(c._id)}
                className={`p-3 rounded-lg cursor-pointer ${activeChat && activeChat._id === c._id ? "bg-yellow-400/20" : "hover:bg-white/5"}`}
              >
                <div className="font-semibold text-sm text-white/90">{c.title || "AI Conversation"}</div>
                <div className="text-xs text-white/70 mt-1">
                  {c.lastMessage ? `${c.lastMessage.role === "user" ? "You: " : "AI: "}${truncate(c.lastMessage.text, 60)}` : "No messages"}
                </div>
                <div className="text-xs text-white/50 mt-1">{new Date(c.updatedAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Active chat */}
        <div className="col-span-3 bg-white/6 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{activeChat?.title || "New conversation"}</h2>
            <div className="text-sm text-white/70">{activeChat ? `Messages: ${activeChat.messages.length}` : ""}</div>
          </div>

          <div className="h-[55vh] overflow-y-auto p-3 bg-black/30 rounded-lg flex flex-col gap-3 mb-3">
            {activeChat && activeChat.messages.length > 0 ? (
              activeChat.messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3 rounded-lg break-words whitespace-pre-wrap ${m.role === "user" ? "self-end bg-white/10 text-white" : "self-start bg-black/40 text-white"}`}
                >
                  <div className="text-[11px] text-white/70 mb-1 font-medium">{m.role === "user" ? "You" : "AI"}</div>
                  <div>{m.text}</div>
                </div>
              ))
            ) : (
              <div className="text-white/70">No messages yet. Type a prompt to start.</div>
            )}
            <div ref={scrollRef} />
          </div>

          {error && <div className="text-red-300 mb-2">{error}</div>}

          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask code help, bugs, explanations, anything..."
            className="w-full p-3 rounded bg-white/20 placeholder-white/70 outline-none text-white mb-3"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold disabled:opacity-60"
            >
              {loading ? "Thinking..." : activeChat ? "Send" : "Start Conversation"}
            </button>
            <button onClick={() => { setPrompt(""); }} className="px-4 py-2 rounded-lg bg-white/10">Reset</button>
            <button onClick={() => { setActiveChat(null); setPrompt(""); }} className="px-4 py-2 rounded-lg bg-white/10">New Conversation</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// small util
const truncate = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

export default PremiumChat;
