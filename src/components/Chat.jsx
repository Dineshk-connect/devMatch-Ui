// src/components/Chat.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

/**
 * Upgraded Chat UI:
 * - Header shows other user's name (if available) and avatar
 * - Sender name is shown above other users' bubbles (not inside)
 * - Date separators between days
 * - Optimistic messages, sending / failed states
 * - Typing indicator
 * - Auto-scroll and dedupe
 *
 * Assumptions:
 * - GET /chat/:targetUserId returns the chat object including populated participants and messages
 * - messages have senderId populated when available
 */

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]); // normalized messages
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null); // { _id, firstName, lastName }
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // --- helpers ---
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const prettyTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const dayLabel = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // normalize server message shape
  const normalizeMessage = (msg) => ({
    _id: msg._id || msg.id || `${msg.senderId?._id || msg.senderId}-${msg.createdAt || Math.random()}`,
    senderId:
      msg.senderId && typeof msg.senderId === "object"
        ? msg.senderId
        : { _id: msg.senderId, firstName: msg.firstName || "Unknown", lastName: msg.lastName || "" },
    text: msg.text,
    createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
    // preserve optimistic/failed flags if present already
    optimistic: msg.optimistic || false,
    failed: msg.failed || false,
  });

  // --- fetch chat & determine other user ---
  const fetchChatMessages = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, { withCredentials: true });
      const chat = res.data;
      const chatMessages = (chat.messages || []).map(normalizeMessage);

      setMessages(chatMessages);
      setChatId(chat._id || chat.id);

      // find the other participant (populated participants expected)
      if (Array.isArray(chat.participants)) {
        const other = chat.participants.find((p) => String(p._id) !== String(userId));
        if (other) setOtherUser(other);
      } else {
        setOtherUser(null);
      }

      // cache
      localStorage.setItem(`chat_${targetUserId}`, JSON.stringify(chatMessages));
      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error("Failed to load chat, falling back to cache:", err);
      const cached = localStorage.getItem(`chat_${targetUserId}`);
      if (cached) {
        setMessages(JSON.parse(cached));
        setTimeout(scrollToBottom, 50);
      }
    }
  }, [targetUserId, userId, scrollToBottom]);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  // --- socket setup ---
  useEffect(() => {
    if (!userId || !targetUserId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    const onConnect = () => {
      socket.emit("joinChat", { firstName: user.firstName, userId, targetUserId, chatId });
    };

    const onMessageReceived = (msg) => {
      const normalized = normalizeMessage(msg);
      setMessages((prev) => {
        // dedupe
        if (prev.some((m) => m._id === normalized._id)) return prev;
        const next = [...prev, normalized];
        localStorage.setItem(`chat_${targetUserId}`, JSON.stringify(next));
        return next;
      });
      setIsTyping(false);
      setTimeout(scrollToBottom, 40);
    };

    const onMessageSentAck = ({ localTempId, savedMessage }) => {
      const normalized = normalizeMessage(savedMessage);
      setMessages((prev) => {
        // replace optimistic message if found, otherwise append if not present
        let replaced = false;
        const mapped = prev.map((m) => {
          if (m._id === localTempId) {
            replaced = true;
            return normalized;
          }
          return m;
        });
        if (!replaced && !mapped.some((m) => m._id === normalized._id)) mapped.push(normalized);
        // dedupe final
        const ids = new Set();
        const unique = [];
        for (const m of mapped) {
          if (!ids.has(m._id)) {
            unique.push(m);
            ids.add(m._id);
          }
        }
        localStorage.setItem(`chat_${targetUserId}`, JSON.stringify(unique));
        return unique;
      });
      setTimeout(scrollToBottom, 40);
    };

    const onTyping = ({ fromUserId, typing }) => {
      if (String(fromUserId) === String(targetUserId)) setIsTyping(Boolean(typing));
    };

    socket.on("connect", onConnect);
    socket.on("messageReceived", onMessageReceived);
    socket.on("messageSentAck", onMessageSentAck);
    socket.on("typing", onTyping);

    // re-join with chatId if available
    if (chatId) {
      socket.emit("joinChat", { userId, targetUserId, chatId, firstName: user.firstName });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("messageReceived", onMessageReceived);
      socket.off("messageSentAck", onMessageSentAck);
      socket.off("typing", onTyping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetUserId, chatId, user.firstName, scrollToBottom]);

  // --- send message ---
  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !userId) return;

    const optimistic = {
      _id: `temp-${Date.now()}`,
      senderId: { _id: userId, firstName: user.firstName, lastName: user.lastName },
      text,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => {
      const next = [...prev, optimistic];
      localStorage.setItem(`chat_${targetUserId}`, JSON.stringify(next));
      return next;
    });

    setNewMessage("");
    setSending(true);
    setTimeout(scrollToBottom, 10);

    // emit socket
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("sendMessage", {
        senderId: userId,
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        targetUserId,
        text,
        chatId,
        localTempId: optimistic._id,
      });
    }

    // persist via REST
    try {
      const res = await axios.post(`${BASE_URL}/chat/${targetUserId}`, { text }, { withCredentials: true });
      const saved = res?.data?.message;
      if (saved) {
        const normalized = normalizeMessage(saved);
        setMessages((prev) => {
          const replaced = prev.map((m) => (m._id === optimistic._id ? normalized : m));
          // dedupe
          const ids = new Set();
          const unique = [];
          for (const m of replaced) {
            if (!ids.has(m._id)) {
              unique.push(m);
              ids.add(m._id);
            }
          }
          localStorage.setItem(`chat_${targetUserId}`, JSON.stringify(unique));
          return unique;
        });
      }
    } catch (err) {
      console.error("Failed to persist message:", err);
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? { ...m, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      // typing indicator
      if (socketRef.current?.connected) {
        socketRef.current.emit("typing", { fromUserId: userId, toUserId: targetUserId, chatId, typing: true });
        if (socketRef.current.__typingTimeout) clearTimeout(socketRef.current.__typingTimeout);
        socketRef.current.__typingTimeout = setTimeout(() => {
          socketRef.current.emit("typing", { fromUserId: userId, toUserId: targetUserId, chatId, typing: false });
        }, 1000);
      }
    }
  };

  // --- UI helpers for grouping by day & showing name only once per consecutive messages
  const groupedByDay = () => {
    const groups = {};
    messages.forEach((m) => {
      const day = dayLabel(m.createdAt);
      groups[day] = groups[day] || [];
      groups[day].push(m);
    });
    return groups; // { "Fri, Nov 28": [msgs], ... }
  };

  const renderAvatar = (person) => {
    const initials = (person?.firstName?.[0] || "U") + (person?.lastName?.[0] || "");
    return (
      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
        {initials.toUpperCase()}
      </div>
    );
  };

  // --- render
  const days = groupedByDay();

  return (
    <div className="max-w-4xl mx-auto border border-gray-700 m-5 h-[80vh] flex flex-col rounded-lg bg-gray-900 text-white shadow-lg overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex items-center gap-4">
        {/* avatar */}
        <div className="flex items-center gap-3">
          {otherUser ? (
            <>
              {renderAvatar(otherUser)}
              <div>
                <div className="text-lg font-semibold">
                  {otherUser.firstName} {otherUser.lastName || ""}
                </div>
                <div className="text-xs text-gray-400">
                  {isTyping ? "typing…" : "Conversation"}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="text-lg font-semibold">Chat</div>
              <div className="text-xs text-gray-400">{/* hide user id line when name unavailable */}</div>
            </div>
          )}
        </div>

        <div className="ml-auto text-sm text-gray-400">
          {/* small context actions could go here */}
          {otherUser ? null : <span className="italic text-xs text-gray-500">{targetUserId}</span>}
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-auto p-4 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
        {/* iterate days */}
        {Object.keys(days).map((dayKey) => (
          <div key={dayKey} className="space-y-3">
            <div className="flex justify-center my-4">
              <div className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">{dayKey}</div>
            </div>

            {/* messages for the day */}
            {days[dayKey].map((msg, idx, arr) => {
              const mine = String(msg.senderId?._id) === String(userId);
              // show name above bubble only if previous message is from different sender
              const prev = arr[idx - 1];
              const showName = !mine && (!prev || String(prev.senderId?._id) !== String(msg.senderId?._id));
              return (
                <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"} items-start`}>
                  {!mine && (
                    <div className="mr-3">
                      {/* show avatar only for the first of consecutive messages */}
                      {showName ? renderAvatar(msg.senderId) : <div className="w-9 h-9" />}
                    </div>
                  )}

                  <div className="max-w-[78%]">
                    {showName && (
                      <div className="text-xs text-gray-400 mb-1">
                        {msg.senderId?.firstName} {msg.senderId?.lastName || ""}
                      </div>
                    )}

                    <div
                      className={`relative inline-block px-4 py-2 rounded-2xl break-words ${
                        mine ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-100"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      <div className="text-sm leading-relaxed">{msg.text}</div>

                      {/* small tail using pseudo-looking absolute element */}
                      <div
                        className={`absolute bottom-0 ${mine ? "-right-2" : "-left-2"} transform translate-y-1 rotate-45 w-3 h-3 ${
                          mine ? "bg-indigo-600" : "bg-gray-800"
                        }`}
                        aria-hidden
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xs text-gray-400">{prettyTime(msg.createdAt)}</span>
                      {msg.optimistic && <span className="text-2xs text-gray-400 opacity-70">Sending…</span>}
                      {msg.failed && <span className="text-2xs text-red-400">Failed</span>}
                      {/* optionally show seen/delivered icons here */}
                    </div>
                  </div>

                  {mine && (
                    <div className="ml-3">
                      {/* show small avatar for mine to keep symmetry */}
                      <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs uppercase">
                        {user?.firstName?.[0] || "U"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* typing indicator */}
        {isTyping && (
          <div className="mt-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs uppercase">{otherUser?.firstName?.[0] || "U"}</div>
            <div className="bg-gray-800 px-3 py-2 rounded-2xl text-sm">typing…</div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-gray-800 bg-gray-900 flex gap-3 items-center">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </footer>
    </div>
  );
};

export default Chat;
