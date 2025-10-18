// API Configuration
// Change this to your deployed backend URL
export const API_BASE_URL = 'https://fintracker-xo80.onrender.com/api';

// Helper to get auth token from localStorage
export const getAuthToken = () => localStorage.getItem('authToken');

// Helper to set auth headers
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});
