// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = location.pathname || "/";

  const isHome = pathname === "/";
  const isCustomerSection = pathname.startsWith("/customer");
  const isProviderSection = pathname.startsWith("/provider");
  const isAdminSection = pathname.startsWith("/admin-dashboard");

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      // ignore errors on logout
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FixitNow
            </div>
            <div className="hidden sm:block text-xs font-semibold text-gray-400 group-hover:text-indigo-400 transition">
              Home Services
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!token ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className={`font-medium transition-colors duration-300 px-3 py-1 rounded-lg ${
                    isHome
                      ? "text-indigo-300 bg-slate-800 shadow-inner"
                      : "text-gray-300 hover:text-indigo-400"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 text-white font-semibold rounded-lg border border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {/* Home Link for all logged-in users */}
                <Link
                  to="/"
                  className="text-gray-300 hover:text-indigo-400 font-medium transition-colors duration-300"
                >
                  Home
                </Link>

                {/* Customer Links */}
                {role === "CUSTOMER" && (
                  <>
                    <Link
                      to="/customer-panel"
                      className={`font-medium transition-colors duration-300 flex items-center gap-2 px-3 py-1 rounded-lg ${
                        isCustomerSection
                          ? "text-indigo-300 bg-slate-800 shadow-inner"
                          : "text-gray-300 hover:text-indigo-400"
                      }`}
                    >
                      <span className="text-lg">🔍</span>
                      Browse
                    </Link>
                    <Link
                      to="/customer/bookings"
                      className={`font-medium transition-colors duration-300 flex items-center gap-2 px-3 py-1 rounded-lg ${
                        isCustomerSection
                          ? "text-indigo-300 bg-slate-800 shadow-inner"
                          : "text-gray-300 hover:text-indigo-400"
                      }`}
                    >
                      <span className="text-lg">📋</span>
                      Bookings
                    </Link>
                  </>
                )}

                {/* Provider Links */}
                {role === "PROVIDER" && (
                  <Link
                    to="/provider"
                    className={`font-medium transition-colors duration-300 flex items-center gap-2 px-3 py-1 rounded-lg ${
                      isProviderSection
                        ? "text-indigo-300 bg-slate-800 shadow-inner"
                        : "text-gray-300 hover:text-indigo-400"
                    }`}
                  >
                    <span className="text-lg">🏢</span>
                    Panel
                  </Link>
                )}

                {/* Admin Links */}
                {role === "ADMIN" && (
                  <Link
                    to="/admin-dashboard"
                    className={`font-medium transition-colors duration-300 flex items-center gap-2 px-3 py-1 rounded-lg ${
                      isAdminSection
                        ? "text-indigo-300 bg-slate-800 shadow-inner"
                        : "text-gray-300 hover:text-indigo-400"
                    }`}
                  >
                    <span className="text-lg">⚙️</span>
                    Admin
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600/20 text-red-400 font-semibold rounded-lg border border-red-600/50 hover:bg-red-600/30 hover:border-red-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-indigo-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700 pt-4 space-y-3">
            {!token ? (
              <>
                <Link
                  to="/"
                  className={`block px-4 py-2 rounded-lg transition-colors duration-300 font-medium text-center ${
                    isHome
                      ? "text-indigo-300 bg-slate-800/70"
                      : "text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-white font-semibold rounded-lg border border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 text-center"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-center"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-colors duration-300 font-medium text-center"
                >
                  Home
                </Link>

                {role === "CUSTOMER" && (
                  <>
                    <Link
                      to="/customer-panel"
                      className={`block px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                        isCustomerSection
                          ? "text-indigo-300 bg-slate-800/70"
                          : "text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50"
                      }`}
                    >
                      🔍 Browse Services
                    </Link>
                    <Link
                      to="/customer/bookings"
                      className={`block px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                        isCustomerSection
                          ? "text-indigo-300 bg-slate-800/70"
                          : "text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50"
                      }`}
                    >
                      📋 My Bookings
                    </Link>
                  </>
                )}

                {role === "PROVIDER" && (
                  <Link
                    to="/provider"
                    className={`block px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                      isProviderSection
                        ? "text-indigo-300 bg-slate-800/70"
                        : "text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50"
                    }`}
                  >
                    🏢 Provider Panel
                  </Link>
                )}

                {role === "ADMIN" && (
                  <Link
                    to="/admin-dashboard"
                    className={`block px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                      isAdminSection
                        ? "text-indigo-300 bg-slate-800/70"
                        : "text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50"
                    }`}
                  >
                    ⚙️ Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 bg-red-600/20 text-red-400 font-semibold rounded-lg border border-red-600/50 hover:bg-red-600/30 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
