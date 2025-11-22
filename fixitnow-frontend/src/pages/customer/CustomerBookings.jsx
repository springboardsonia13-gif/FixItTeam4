
// src/pages/customer/CustomerBookings.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import ReviewModal from "./ReviewModal";
import ChatWindow from "../../components/ChatWindow";
import DisputeModal from "../../components/DisputeModal";
import ServiceChatView from "../../components/ServiceChatView";

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-gradient-to-r from-yellow-400/20 to-amber-400/20 text-yellow-700 border border-yellow-300/50",
    CONFIRMED: "bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-700 border border-green-300/50",
    COMPLETED: "bg-gradient-to-r from-blue-400/20 to-cyan-400/20 text-blue-700 border border-blue-300/50",
    REJECTED: "bg-gradient-to-r from-red-400/20 to-rose-400/20 text-red-700 border border-red-300/50",
    CANCELLED: "bg-gradient-to-r from-gray-400/20 to-slate-400/20 text-gray-700 border border-gray-300/50",
  };

  const icons = {
    PENDING: "⏳",
    CONFIRMED: "✅",
    COMPLETED: "🎉",
    REJECTED: "❌",
    CANCELLED: "🚫",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${styles[status] || styles.PENDING}`}
      aria-label={`Status: ${status}`}
    >
      <span>{icons[status]}</span>
      {status}
    </span>
  );
}

export default function CustomerBookings() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [chatProvider, setChatProvider] = useState(null);
  const [bookingReviews, setBookingReviews] = useState({}); // Store reviews by booking ID
  const [busyId, setBusyId] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage("");
    try {
      const res = await api.get("/api/customer/bookings");
      const bookingsData = res.data || [];
      setBookings(bookingsData);

      // Fetch reviews for completed bookings (non-blocking)
      const reviewsMap = {};
      for (const booking of bookingsData) {
        if (booking.status === "COMPLETED") {
          try {
            const reviewRes = await api.get(`/api/reviews/booking/${booking.id}`);
            if (reviewRes.data) reviewsMap[booking.id] = reviewRes.data;
          } catch (err) {
            // no review yet or error — ignore
          }
        }
      }
      setBookingReviews(reviewsMap);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(err.response?.data?.error || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalUnreadChats = async () => {
    try {
      const res = await api.get("/api/disputes/service-chats/unread-total");
      setTotalUnreadChats(res.data.totalUnread || 0);
    } catch (e) {
      console.error("Failed to fetch unread count", e);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTotalUnreadChats();
    // Refresh unread count every 5 seconds
    const interval = setInterval(fetchTotalUnreadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setBusyId(bookingId);
      await api.post(`/api/customer/bookings/${bookingId}/cancel`);
      // preserve existing alert behaviour
      alert("Booking cancelled successfully");
      setInfoMessage("Booking cancelled");
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel booking");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkComplete = async (bookingId) => {
    if (
      !window.confirm(
        "Mark this booking as completed? You'll be able to leave a review after this."
      )
    )
      return;

    try {
      setBusyId(bookingId);
      await api.post(`/api/customer/bookings/${bookingId}/complete`);
      alert("Booking marked as completed! You can now leave a review.");
      setInfoMessage("Booking marked completed");
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to mark booking as complete");
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenChat = (providerId) => {
    setChatProvider({
      id: providerId,
      name: `Provider #${providerId}`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-600">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <div className="mt-4">
          <button
            onClick={fetchBookings}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 text-lg">Manage your service bookings and communicate with providers</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bookings Dashboard</h2>
                <p className="text-gray-600 text-sm mt-1">Track and manage all your service bookings</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200" aria-live="polite" role="status">
                  {activeTab === "bookings" && (loading ? "Loading..." : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`)}
                </div>

                {activeTab === "bookings" && (
                  <button
                    onClick={fetchBookings}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition font-medium text-gray-700 hover:text-gray-900"
                    aria-label="Refresh bookings"
                  >
                    🔄 Refresh
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("service-chats")}
                  className="relative px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
                  aria-label="View service chats"
                >
                  💬 Service Chats
                  {totalUnreadChats > 0 && (
                    <span className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      {totalUnreadChats > 9 ? "9+" : totalUnreadChats}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === "bookings"
                  ? "border-b-4 border-indigo-600 text-indigo-700 bg-white"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
              }`}
            >
              📋 My Bookings
            </button>
            <button
              onClick={() => setActiveTab("service-chats")}
              className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                activeTab === "service-chats"
                  ? "border-b-4 border-indigo-600 text-indigo-700 bg-white"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
              }`}
            >
              💬 Service Chats
              {totalUnreadChats > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalUnreadChats > 9 ? "9+" : totalUnreadChats}
                </span>
              )}
            </button>
          </div>

          <div className="p-8">
            {infoMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 font-semibold" role="status">
                ✅ {infoMessage}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <>
                {bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-6xl mb-6">📋</div>
                    <p className="text-2xl font-semibold mb-2">No bookings yet</p>
                    <p className="text-lg mb-8">Browse services and make your first booking!</p>
                    <a
                      href="/customer-panel"
                      className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg hover:shadow-xl"
                    >
                      🔍 Browse Services
                    </a>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {bookings.map((booking) => {
                      const review = bookingReviews[booking.id];
                      const isBusy = busyId === booking.id;
                      return (
                        <div key={booking.id} className="bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:border-indigo-200">
                          <div className="flex justify-between items-start gap-6 flex-col lg:flex-row">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <div>
                                  <h3 className="font-bold text-xl text-gray-800">Service #{booking.serviceId}</h3>
                                  <p className="text-sm text-gray-500">Provider ID: {booking.providerId}</p>
                                </div>
                                <StatusBadge status={booking.status} />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                  <p className="text-xs text-indigo-600 font-semibold">📅 Date</p>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "N/A"}
                                  </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                  <p className="text-xs text-purple-600 font-semibold">🕐 Time</p>
                                  <p className="text-sm font-semibold text-gray-800">{booking.timeSlot || "N/A"}</p>
                                </div>
                                <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
                                  <p className="text-xs text-pink-600 font-semibold">📍 Location</p>
                                  <p className="text-sm font-semibold text-gray-800">Service</p>
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                  <p className="text-sm text-blue-900"><strong>📝 Notes:</strong> {booking.notes}</p>
                                </div>
                              )}

                              {/* Show review if exists */}
                              {review && (
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-yellow-800">⭐ Your Review</span>
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{review.comment || "No comment"}</p>
                                  <p className="text-xs text-gray-500">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                              )}

                              <p className="text-xs text-gray-400 mt-4">
                                Booked on: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}
                              </p>
                            </div>

                            <div className="flex flex-col gap-3 lg:w-48">
                              {/* Chat button */}
                              {(booking.status === "PENDING" ||
                                booking.status === "CONFIRMED" ||
                                booking.status === "COMPLETED") && (
                                <button
                                  onClick={() => handleOpenChat(booking.providerId)}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-md hover:shadow-lg"
                                  aria-label={`Chat with provider ${booking.providerId}`}
                                >
                                  💬 Chat
                                </button>
                              )}

                              {/* Cancel and Mark Complete buttons */}
                              {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                <>
                                  <button
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={isBusy}
                                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-md hover:shadow-lg"
                                    aria-label={`Cancel booking ${booking.id}`}
                                  >
                                    {isBusy ? "Canceling…" : "❌ Cancel"}
                                  </button>

                                  {booking.status === "CONFIRMED" && (
                                    <button
                                      onClick={() => handleMarkComplete(booking.id)}
                                      disabled={isBusy}
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-md hover:shadow-lg"
                                      aria-label={`Mark booking ${booking.id} as complete`}
                                    >
                                      {isBusy ? "Updating…" : "✓ Complete"}
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Leave Review button */}
                              {booking.status === "COMPLETED" && !review && (
                                <button
                                  onClick={() => setReviewBooking(booking)}
                                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                                  aria-label={`Leave review for booking ${booking.id}`}
                                >
                                  ⭐ Review
                                </button>
                              )}

                              {/* Report Issue button */}
                              {booking.status === "COMPLETED" && (
                                <button
                                  onClick={() => setDisputeBooking(booking)}
                                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition font-semibold shadow-md hover:shadow-lg"
                                  aria-label={`Report issue for booking ${booking.id}`}
                                >
                                  🚨 Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Service Chats Tab */}
            {activeTab === "service-chats" && (
              <ServiceChatView />
            )}
          </div>
        </div>
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}

      {chatProvider && (
        <ChatWindow
          receiverId={chatProvider.id}
          receiverName={chatProvider.name}
          onClose={() => setChatProvider(null)}
        />
      )}

      {disputeBooking && (
        <DisputeModal
          booking={disputeBooking}
          onClose={() => setDisputeBooking(null)}
          onSuccess={() => {
            setDisputeBooking(null);
            setInfoMessage("Dispute submitted successfully. Our team will review it.");
          }}
        />
      )}
    </div>
  );
}

