import React, { useState } from "react";
import api from "../api/axiosInstance";

export default function DisputeModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({
    category: "SERVICE_QUALITY",
    subject: "",
    description: "",
    refundAmount: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!form.subject || !form.description) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId: booking.id,
        category: form.category,
        subject: form.subject,
        description: form.description
      };

      if (form.refundAmount) {
        payload.refundAmount = parseFloat(form.refundAmount);
      }

      await api.post("/api/disputes", payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Report an Issue</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Booking #{booking.id}</div>
            <div className="text-sm text-gray-600">Service #{booking.serviceId}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              >
                <option value="SERVICE_QUALITY">Service Quality</option>
                <option value="BILLING">Billing Issue</option>
                <option value="CANCELLATION">Cancellation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                rows={5}
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount (₹) <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.refundAmount}
                onChange={(e) => setForm({ ...form, refundAmount: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                placeholder="Enter amount if requesting refund"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
