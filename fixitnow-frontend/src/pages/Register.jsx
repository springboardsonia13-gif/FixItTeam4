

import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { reverseGeocodeLatLng } from "../utils/googleLocation";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    // location is the human-readable locationName
    location: "",
    latitude: null,
    longitude: null,
  });
  const [msg, setMsg] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const nav = useNavigate();

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setMsg("❌ Geolocation not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    setMsg("🔄 Detecting your location (this may take a moment)...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy && accuracy > 5000) {
          setMsg(
            "⚠️ Approximate location detected. For better accuracy, please try again or edit the location name."
          );
        }

        try {
          const locationName = await reverseGeocodeLatLng(latitude, longitude);

          setForm((f) => ({
            ...f,
            location: locationName,
            latitude,
            longitude,
          }));

          setMsg(`📍 Detected: ${locationName}`);
        } catch (err) {
          console.error("Error reverse geocoding with Google:", err);
          setForm((f) => ({
            ...f,
            location: "Location near you",
            latitude,
            longitude,
          }));
          setMsg("📍 Location captured (could not resolve exact address)");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        let errorMsg = "❌ Could not detect your location. ";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg +=
              "Please enable location access in your browser settings or enter your location manually.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg +=
              "Location information is unavailable. Please try again or enter your location manually.";
            break;
          case err.TIMEOUT:
            errorMsg +=
              "Location request timed out. Please try again or enter your location manually.";
            break;
          default:
            errorMsg += "Please enter your location manually.";
        }
        setMsg(errorMsg);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.location) {
      setMsg("❌ Please capture your location before registering");
      return;
    }
    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      setMsg("✅ Registered successfully. Please login.");
      nav("/login");
    } catch (err) {
      setMsg(err?.response?.data?.error || "❌ Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Floating decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '0.7s'}}></div>
        
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:shadow-3xl transition-all duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white/80 text-sm">Join us and start your journey today</p>
            </div>
          </div>

          {/* Form section */}
          <div className="p-8">
            <form onSubmit={submit} className="space-y-5">
              {/* Name input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200"
                    placeholder="your.email@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Account Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <select
                    className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="PROVIDER">Provider</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Location capture section */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Location <span className="text-red-600">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={captureLocation}
                      disabled={loadingLocation}
                      className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 active:scale-95"
                    >
                      {loadingLocation ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Capture</span>
                        </>
                      )}
                    </button>
                    {form.location && (
                      <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-4 py-3 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-blue-700 font-medium truncate">
                          {form.location}
                        </span>
                      </div>
                    )}
                  </div>
                  {form.location && (
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Edit location name (e.g., Kopargaon, Pune)"
                      className="w-full border-2 border-gray-300 px-4 py-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 mt-6"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Register</span>
              </button>

              {/* Message display */}
              {msg && (
                <div
                  className={`text-sm p-4 rounded-xl border-2 flex items-start space-x-3 ${
                    msg.startsWith("✅")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : msg.startsWith("📍")
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <svg 
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      msg.startsWith("✅") ? "text-green-600" : 
                      msg.startsWith("📍") ? "text-blue-600" : "text-red-600"
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {msg.startsWith("✅") ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : msg.startsWith("📍") ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <p className="font-medium">{msg}</p>
                </div>
              )}
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => nav("/login")}
                  className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decoration text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}