import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

export default function UserProfileModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${userId}`);
      setUser(res.data);
    } catch (e) {
      console.error("Failed to fetch user profile", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
          <p className="text-red-600 text-center">Failed to load user profile</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-indigo-100 text-sm mt-1">{user.role}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="border-b pb-4">
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium text-gray-800">{user.email}</div>
          </div>

          {user.location && (
            <div className="border-b pb-4">
              <div className="text-sm text-gray-600">📍 Location</div>
              <div className="font-medium text-gray-800">{user.location}</div>
            </div>
          )}

          {user.role === "PROVIDER" && (
            <>
              {user.categories && (
                <div className="border-b pb-4">
                  <div className="text-sm text-gray-600">Categories</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(user.categories)
                      ? user.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                          >
                            {cat}
                          </span>
                        ))
                      : null}
                  </div>
                </div>
              )}

              {user.verificationStatus && (
                <div className="border-b pb-4">
                  <div className="text-sm text-gray-600">Verification Status</div>
                  <div
                    className={`font-medium mt-1 px-3 py-1 rounded-full text-sm inline-block ${
                      user.verificationStatus === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : user.verificationStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.verificationStatus}
                  </div>
                </div>
              )}
            </>
          )}

          {user.createdAt && (
            <div>
              <div className="text-sm text-gray-600">Member Since</div>
              <div className="font-medium text-gray-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
