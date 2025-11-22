
// src/pages/customer/ChatWithAdmin.jsx
import React, { useEffect, useState } from "react";
import ChatWindow from "../../components/ChatWindow";
import api from "../../api/axiosInstance";

export default function ChatWithAdmin() {
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Find admin user ID
    const findAdmin = async () => {
      try {
        const res = await api.get("/api/admin/users");
        const admin = res.data.find((u) => u.role === "ADMIN");
        if (admin) {
          setAdminId(admin.id);
        } else {
          setError("No admin account found. Please try again later.");
        }
      } catch (err) {
        console.error("Failed to find admin", err);
        setError("Failed to connect to server. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    findAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-700 font-medium">Connecting to Admin Support...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center border border-red-100 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">⚠️ Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-gray-600">Looking for an admin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2">
            🛠️ Admin Support Chat
          </h2>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        </div>
        <ChatWindow
          receiverId={adminId}
          receiverName="Admin Support"
          onClose={() => window.history.back()}
        />
      </div>
    </div>
  );
}
