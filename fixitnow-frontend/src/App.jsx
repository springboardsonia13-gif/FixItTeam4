
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";

// Common pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ServiceDetail from "./pages/ServiceDetail";
import MapSearch from "./pages/MapSearch";

// Role-specific panels
import ProviderPanel from "./pages/provider/ProviderPanel";
import CustomerPanel from "./pages/customer/CustomerPanel";
import CustomerBookings from "./pages/customer/CustomerBookings";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

// ===== Helpers =====
const getToken = () => localStorage.getItem("accessToken");
const getRole = () => localStorage.getItem("role");

function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const token = getToken();
  const r = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (!r || r.toUpperCase() !== role.toUpperCase()) {
    if (r === "CUSTOMER") return <Navigate to="/customer-panel" replace />;
    if (r === "PROVIDER") return <Navigate to="/provider" replace />;
    if (r === "ADMIN") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

// ===== Main App =====
export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container mx-auto px-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/map" element={<MapSearch />} />
          

          {/* Customer routes */}
          <Route
            path="/customer-panel"
            element={
              <RequireRole role="CUSTOMER">
                <CustomerPanel />
              </RequireRole>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <RequireRole role="CUSTOMER">
                <CustomerBookings />
              </RequireRole>
            }
          />

          {/* Provider routes */}
          <Route
            path="/provider"
            element={
              <RequireRole role="PROVIDER">
                <ProviderPanel />
              </RequireRole>
            }
          />

          {/* Admin route */}
          <Route
            path="/admin-dashboard"
            element={
              <RequireRole role="ADMIN">
                <AdminDashboard />
              </RequireRole>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}