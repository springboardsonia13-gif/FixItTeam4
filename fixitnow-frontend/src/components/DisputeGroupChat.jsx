import React, { useState, useEffect, useRef } from "react";
import api from "../api/axiosInstance";

export default function DisputeGroupChat({ disputeId, customerId, providerId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [providerName, setProviderName] = useState("Provider");
  const [adminName] = useState("Admin");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroupChatMessages();
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    if (userId) setCurrentUserId(parseInt(userId));
    if (userRole) setCurrentUserRole(userRole);
  }, [disputeId]);

  useEffect(() => {
    // Find the first unread message and scroll to it
    const firstUnreadIndex = messages.findIndex(msg => !msg.isRead && msg.senderId !== currentUserId);
    if (firstUnreadIndex !== -1) {
      // Scroll to first unread message
      setTimeout(() => {
        const messageElements = document.querySelectorAll('[data-message-id]');
        if (messageElements[firstUnreadIndex]) {
          messageElements[firstUnreadIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      // If no unread messages, scroll to bottom
      scrollToBottom();
    }
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroupChatMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/disputes/${disputeId}/group-chat`);
      setMessages(res.data.messages || []);
      
      // Fetch user details
      if (customerId) {
        try {
          const customerRes = await api.get(`/api/admin/users/${customerId}`);
          setCustomerName(customerRes.data.name || "Customer");
        } catch (e) {
          console.error("Failed to fetch customer name", e);
        }
      }
      
      if (providerId) {
        try {
          const providerRes = await api.get(`/api/admin/users/${providerId}`);
          setProviderName(providerRes.data.name || "Provider");
        } catch (e) {
          console.error("Failed to fetch provider name", e);
        }
      }
    } catch (e) {
      console.error("Failed to fetch group chat messages", e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Determine sender type based on user ID and role
      let senderType = "ADMIN";
      if (currentUserId === customerId) {
        senderType = "CUSTOMER";
      } else if (currentUserId === providerId) {
        senderType = "PROVIDER";
      }

      await api.post(`/api/disputes/${disputeId}/group-chat`, {
        message: newMessage,
        senderType: senderType
      });
      setNewMessage("");
      fetchGroupChatMessages();
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    }
  };

  const getSenderDisplayName = (senderType, senderId) => {
    if (senderType === "ADMIN") return adminName;
    if (senderType === "CUSTOMER") return customerName;
    if (senderType === "PROVIDER") return providerName;
    return "Unknown";
  };

  const getSenderColor = (senderType) => {
    if (senderType === "ADMIN") return "bg-indigo-100 border-indigo-300";
    if (senderType === "CUSTOMER") return "bg-blue-100 border-blue-300";
    if (senderType === "PROVIDER") return "bg-green-100 border-green-300";
    return "bg-gray-100 border-gray-300";
  };

  const getMessageBubbleColor = (senderType) => {
    if (senderType === "ADMIN") return "bg-indigo-600 text-white";
    if (senderType === "CUSTOMER") return "bg-blue-500 text-white";
    if (senderType === "PROVIDER") return "bg-green-500 text-white";
    return "bg-gray-400 text-white";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading group chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">💬 Service Chat</h3>
            <p className="text-sm text-indigo-100">Dispute #{disputeId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Participants Info */}
        <div className="bg-gray-50 px-4 py-3 border-b flex gap-4 text-sm flex-wrap">
          <div className={`px-3 py-1 rounded-full border ${getSenderColor("CUSTOMER")}`}>
            👤 {customerName} {currentUserId === customerId ? "(You)" : ""}
          </div>
          <div className={`px-3 py-1 rounded-full border ${getSenderColor("PROVIDER")}`}>
            👨‍💼 {providerName} {currentUserId === providerId ? "(You)" : ""}
          </div>
          <div className={`px-3 py-1 rounded-full border ${getSenderColor("ADMIN")}`}>
            👨‍⚖️ {adminName} {currentUserRole === "ADMIN" && currentUserId !== customerId && currentUserId !== providerId ? "(You)" : ""}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation to resolve this dispute</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                data-message-id={idx}
                className={`flex ${
                  msg.senderType === "ADMIN" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-xs">
                  <div className="text-xs text-gray-600 mb-1 px-2">
                    {getSenderDisplayName(msg.senderType, msg.senderId)}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${getMessageBubbleColor(
                      msg.senderType
                    )}`}
                  >
                    {msg.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t p-4 bg-gray-50 rounded-b-2xl flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
