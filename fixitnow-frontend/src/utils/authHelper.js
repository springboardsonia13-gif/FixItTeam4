// src/utils/authHelper.js
import api from "../api/axiosInstance";

/**
 * Get current authenticated user info from backend
 * Returns: { id, email, name, role, location }
 */
export async function getCurrentUser() {
  try {
    const res = await api.get("/api/auth/me");
    return res.data;
  } catch (err) {
    console.error("Failed to get current user:", err);
    return null;
  }
}

/**
 * Get current user ID (cached in localStorage after login)
 * If not cached, fetches from backend
 */
export async function getCurrentUserId() {
  // Try to get from localStorage first
  let userId = localStorage.getItem("userId");
  
  if (!userId) {
    // Fetch from backend and cache
    const user = await getCurrentUser();
    if (user && user.id) {
      userId = user.id;
      localStorage.setItem("userId", userId);
    }
  }
  
  return userId ? parseInt(userId) : null;
}

/**
 * Clear cached user data (call on logout)
 */
export function clearUserCache() {
  localStorage.removeItem("userId");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

/**
 * Get user role from localStorage
 */
export function getUserRole() {
  return localStorage.getItem("role");
}