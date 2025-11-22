

import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const data = res.data;

      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const role = data.role;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (role) localStorage.setItem("role", role);

      // ✅ Fetch user details to get user ID
      try {
        const userRes = await api.get("/api/auth/me");
        if (userRes.data && userRes.data.id) {
          localStorage.setItem("userId", userRes.data.id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }

      setMsg("✅ Login successful! Redirecting...");

      setTimeout(() => {
        if (role === "CUSTOMER") nav("/customer-panel");
        else if (role === "PROVIDER") nav("/provider");
        else if (role === "ADMIN") nav("/admin-dashboard");
        else nav("/");
      }, 800);
    } catch (err) {
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
      setMsg(serverMsg ? `❌ ${serverMsg}` : "❌ Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="relative">
          {/* subtle decorative blobs (kept subtle like Register.jsx) */}
          <div className="absolute -top-12 -left-8 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
          <div className="absolute -bottom-10 -right-6 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:shadow-3xl transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM3 20a9 9 0 0118 0" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-white/80 text-sm">Sign in to continue to your dashboard</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={submit} className="space-y-5" aria-describedby="login-help">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none pr-12 transition-all duration-200"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center px-2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>🔑 Login</span>
                </button>

                {/* message area (aria-live for screen readers) */}
                {msg && (
                  <div
                    id="login-help"
                    role="status"
                    aria-live="polite"
                    className={`text-sm mt-2 p-3 rounded-xl border-2 ${
                      msg.startsWith("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {msg}
                  </div>
                )}
              </form>

              <div className="text-center mt-4 text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">By signing in you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
