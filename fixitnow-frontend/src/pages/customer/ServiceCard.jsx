
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function ServiceCard({ service }) {
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    timeSlot: "09:00-10:00",
    notes: ""
  });
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleBook = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login to book services");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      
      // Get customer's current location
      let customerLatitude = null;
      let customerLongitude = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
          });
          customerLatitude = position.coords.latitude;
          customerLongitude = position.coords.longitude;
        } catch (err) {
          console.warn("Could not get user location:", err);
        }
      }
      
      const payload = {
        serviceId: service.id,
        bookingDate: bookingForm.bookingDate,
        timeSlot: bookingForm.timeSlot,
        notes: bookingForm.notes,
        customerLatitude,
        customerLongitude
      };

      const res = await api.post("/api/bookings", payload);

      if (res.data && (res.data.success || res.status === 200)) {
        setMessage({ type: "success", text: "Booking request sent successfully!" });
        setShowBooking(false);
        setBookingForm({ bookingDate: "", timeSlot: "09:00-10:00", notes: "" });

        // keep existing behavior: navigate after a short delay
        setTimeout(() => {
          navigate("/customer/bookings");
        }, 2000);
      } else {
        const errorMsg = (res.data && res.data.error) || "Booking failed. Please try again.";
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Booking failed. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "14:00-15:00", "15:00-16:00",
    "16:00-17:00", "17:00-18:00"
  ];

  return (
    <article className="bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:border-indigo-300 hover:-translate-y-1">
      <div className="flex justify-between items-start gap-6 flex-col sm:flex-row">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3 flex-wrap">
            <div>
              <h5 className="font-bold text-lg text-gray-900">
                {service.category}
              </h5>
              {service.subcategory && (
                <p className="text-sm text-gray-600">{service.subcategory}</p>
              )}
            </div>
            {service.providerVerified && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200" title="Verified Provider">
                ✓ Verified
              </span>
            )}
          </div>

          <p className="text-gray-700 mt-3 text-sm leading-relaxed">
            {service.description ? service.description.substring(0, 150) : "Professional service available"}
            {service.description?.length > 150 && "..."}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <div className="bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-semibold">📍 Location</p>
              <p className="text-sm font-semibold text-gray-800">{service.location || "N/A"}</p>
            </div>
            {service.distanceKm != null && (
              <div className="bg-purple-50 rounded-lg px-3 py-2 border border-purple-100">
                <p className="text-xs text-purple-600 font-semibold">🚗 Distance</p>
                <p className="text-sm font-semibold text-gray-800">{Number(service.distanceKm).toFixed(1)} km</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            by <span className="font-semibold text-gray-700">{service.providerName || `Provider #${service.providerId}`}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 sm:w-auto">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-semibold mb-1">Starting from</p>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {service.price != null ? `₹${service.price}` : "—"}
            </div>
          </div>
          <button
            onClick={() => setShowBooking((s) => !s)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            aria-expanded={showBooking}
            aria-controls={`booking-form-${service.id}`}
          >
            📅 Book Now
          </button>
        </div>
      </div>

      {showBooking && (
        <section id={`booking-form-${service.id}`} className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200" aria-labelledby={`book-heading-${service.id}`}>
          <h6 id={`book-heading-${service.id}`} className="font-bold text-lg mb-4 text-gray-900">📅 Complete Your Booking</h6>

          <form onSubmit={handleBook} className="space-y-4" aria-live="polite">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Select Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingForm.bookingDate}
                onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                className="w-full border-2 border-indigo-300 rounded-xl px-4 py-2 bg-white focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Choose Time Slot</label>
              <select
                required
                value={bookingForm.timeSlot}
                onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                className="w-full border-2 border-indigo-300 rounded-xl px-4 py-2 bg-white focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition font-medium"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">
                📝 Additional Notes (optional)
              </label>
              <textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Describe your specific requirements or preferences..."
                className="w-full border-2 border-indigo-300 rounded-xl px-4 py-2 bg-white focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition font-medium"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label={`Confirm booking for service ${service.id}`}
              >
                {submitting ? "Processing…" : "✓ Confirm Booking"}
              </button>

              <button
                type="button"
                onClick={() => setShowBooking(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-white transition font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>

          {message && (
            <div
              role="status"
              className={`mt-4 p-4 rounded-xl text-sm font-semibold border-2 ${
                message.type === "success"
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800"
              }`}
            >
              {message.type === "success" ? "✅" : "❌"} {message.text}
            </div>
          )}
        </section>
      )}
    </article>
  );
}
