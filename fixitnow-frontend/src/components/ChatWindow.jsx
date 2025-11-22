
// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api from "../api/axiosInstance";

export default function ChatWindow({ receiverId, receiverName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUserId = parseInt(localStorage.getItem("userId"));

  // Fetch message history
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/chat/conversation/${receiverId}`);
        if (!mounted) return;
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [receiverId]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!currentUserId) {
      console.error("User ID not found");
      return;
    }

    const socket = new SockJS(
      `${import.meta.env.VITE_API_BASE || "http://localhost:8080"}/ws`
    );

    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setConnected(true);

        // Subscribe to personal queue
        client.subscribe(`/queue/messages.${currentUserId}`, (message) => {
          const received = JSON.parse(message.body);
          setMessages((prev) => [...prev, received]);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep input focused when chat opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !connected) return;

    const payload = {
      senderId: currentUserId,
      receiverId: receiverId,
      content: newMessage.trim(),
    };

    // Send via WebSocket (same as before)
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });
    }

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 w-96 h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden"
      role="dialog"
      aria-label={`Chat with ${receiverName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
              {receiverName ? receiverName.split(" ").map(s => s[0]).join("").slice(0,2) : "??"}
            </div>
            <div>
              <div className="font-semibold text-sm">{receiverName}</div>
              <div className="text-xs opacity-90" aria-live="polite">
                {connected ? "🟢 Connected" : "🔴 Disconnected"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // preserve existing onClose behavior
              if (onClose) onClose();
            }}
            className="text-white text-2xl hover:text-gray-200 focus:outline-none rounded-full p-1"
            aria-label="Close chat"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] p-3 rounded-2xl leading-relaxed text-sm ${
                    isMe ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-2 text-xs opacity-70 text-right">
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 min-h-[44px] max-h-36 resize-y border-2 border-gray-200 rounded-2xl px-3 py-2 focus:ring-4 focus:ring-indigo-100 outline-none transition disabled:bg-gray-100"
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !newMessage.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 border rounded">Shift</kbd>+<kbd className="px-1 py-0.5 bg-gray-100 border rounded">Enter</kbd> for newline.
        </div>
      </div>
    </div>
  );
}
