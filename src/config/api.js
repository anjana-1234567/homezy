// Centralized API configuration for Homezy frontend

const rawUrl = (
  import.meta.env.VITE_API_URL || "https://homezy-1.onrender.com"
)
  .trim()
  .replace(/\/+$/, "");

// Host origin without trailing slash or /api (e.g., https://homezy-xtr2.onrender.com)
export const BASE_URL = rawUrl.endsWith("/api")
  ? rawUrl.slice(0, -4)
  : rawUrl;

// Standard API root (e.g., https://homezy-xtr2.onrender.com/api)
export const API_BASE_URL = `${BASE_URL}/api`;

// Route groups matching backend Express routers
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  SERVICES: `${API_BASE_URL}/services`,
  BOOKINGS: `${API_BASE_URL}/bookings`,
  COMPLAINTS: `${API_BASE_URL}/complaints`,
  REVIEWS: `${API_BASE_URL}/reviews`,
  LOCATION: `${API_BASE_URL}/location`,
  ADMIN: `${API_BASE_URL}/admin`,
  PAYMENTS: `${API_BASE_URL}/payments`,
};

export default API_BASE_URL;
