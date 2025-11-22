import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import DisputeGroupChat from "./DisputeGroupChat";

export default function ServiceChatView() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchServiceChats();
    // Refresh unread counts every 5 seconds
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServiceChats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/disputes/service-chats/my");
      setDisputes(res.data || []);
      fetchUnreadCounts();
    } catch (e) {
      console.error("Failed to fetch service chats", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get("/api/disputes/service-chats/my");
      const chats = res.data || [];
      
      const counts = {};
      for (const chat of chats) {
        try {
          const countRes = await api.get(`/api/disputes/${chat.id}/group-chat/unread-count`);
          counts[chat.id] = countRes.data.unreadCount || 0;
        } catch (e) {
          counts[chat.id] = 0;
        }
      }
      setUnreadCounts(counts);
    } catch (e) {
      console.error("Failed to fetch unread counts", e);
    }
  };

  const handleChatOpen = async (dispute) => {
    setSelectedChat(dispute);
    // Mark messages as read
    try {
      await api.put(`/api/disputes/${dispute.id}/group-chat/mark-read`);
      setUnreadCounts(prev => ({ ...prev, [dispute.id]: 0 }));
    } catch (e) {
      console.error("Failed to mark messages as read", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading service chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">💬 Service Chats</h3>
        <button
          onClick={fetchServiceChats}
          className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">✨ You are not in any service chats</p>
          <p className="text-gray-500 text-sm mt-1">Service chats will appear here when an admin initiates one for a dispute</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => {
            const unreadCount = unreadCounts[dispute.id] || 0;
            return (
              <div
                key={dispute.id}
                className={`border-2 p-4 rounded-lg bg-white hover:shadow-md transition cursor-pointer relative ${
                  unreadCount > 0 ? "border-red-300" : "border-gray-200"
                }`}
                onClick={() => handleChatOpen(dispute)}
              >
                {unreadCount > 0 && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-gray-800">Service Chat #{dispute.id}</div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      📋 Booking #{dispute.bookingId} • 🏷️ {dispute.category}
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <strong>Issue:</strong> {dispute.subject}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                      dispute.status === "RESOLVED"
                        ? "bg-green-100 text-green-800"
                        : dispute.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : dispute.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {dispute.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedChat && (
        <DisputeGroupChat
          disputeId={selectedChat.id}
          customerId={selectedChat.customerId}
          providerId={selectedChat.providerId}
          onClose={() => {
            setSelectedChat(null);
            fetchServiceChats();
          }}
        />
      )}
    </div>
  );
}
