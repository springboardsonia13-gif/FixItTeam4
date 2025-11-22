import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ServiceDetail(){
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00-10:00');
  const [notes, setNotes] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchService();
  }, [id]);

  async function fetchService(){
    try{
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${base}/api/services/${id}`);
      if (!res.ok) throw new Error('Service not found');
      const data = await res.json();
      setService(data);
    }catch(err){
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function submitBooking(e){
    e.preventDefault();
    setMessage(null);
    try{
      if (!customerId) return setMessage({ type:'error', text:'Enter customerId (or login first)' });
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const payload = { serviceId: Number(id), customerId: Number(customerId), bookingDate: date, timeSlot, notes };
      const res = await fetch(`${base}/api/bookings`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Booking failed');
      setMessage({ type:'success', text: 'Booking created (id: ' + json.bookingId + ')' });
    }catch(err){
      setMessage({ type:'error', text: err.message });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">Service not found</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          ← Back
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {service.category}
                  </h1>
                  <p className="text-xl text-indigo-600 font-semibold">
                    {service.subcategory}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    ₹{service.price}
                  </div>
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Available
                  </span>
                </div>
              </div>

              {/* Provider Info */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Provider</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{service.providerName}</p>
                    <p className="text-gray-600">{service.providerEmail}</p>
                  </div>
                  {service.providerVerified && (
                    <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                      <span className="text-xl">✓</span> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                {service.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{service.location}</p>
                </div>
                {/* Coordinates are intentionally not shown to end users; only human-readable location is displayed */}
              </div>
            </div>

            {/* Provider Profile */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Provider Profile</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {service.providerProfileDescription}
              </p>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-2">Specializations</p>
                <p className="font-semibold text-gray-900">{service.providerProfileCategories}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Reviews</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-yellow-500">★</span>
                  <span className="text-2xl font-bold text-gray-900">{service.avgRating || 'N/A'}</span>
                </div>
              </div>
              
              {service.reviews && service.reviews.length > 0 ? (
                <div className="space-y-4">
                  {service.reviews.map(r => (
                    <div key={r.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < r.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Book This Service</h3>
              
              <form onSubmit={submitBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="number"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    placeholder="Enter your ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  >
                    <option value="09:00-10:00">09:00 - 10:00 AM</option>
                    <option value="10:00-11:00">10:00 - 11:00 AM</option>
                    <option value="11:00-12:00">11:00 - 12:00 PM</option>
                    <option value="14:00-15:00">02:00 - 03:00 PM</option>
                    <option value="15:00-16:00">03:00 - 04:00 PM</option>
                    <option value="16:00-17:00">04:00 - 05:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tell us more about your needs..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Request Booking
                </button>
              </form>

              {message && (
                <div className={`mt-6 p-4 rounded-lg font-semibold text-center ${
                  message.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

