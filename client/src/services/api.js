import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Show error toast
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
  getProfile: () => API.get('/api/auth/me'),
  updateProfile: (data) => API.put('/api/auth/profile', data),
  changePassword: (data) => API.put('/api/auth/change-password', data),
  deactivateAccount: () => API.delete('/api/auth/deactivate'),
};

// Issue APIs
export const issueAPI = {
  // Get all issues with filters
  getAllIssues: (params = {}) => API.get('/api/issues', { params }),
  
  // Get single issue by ID
  getIssueById: (id) => API.get(`/api/issues/${id}`),
  
  // Create new issue
  createIssue: (formData) => API.post('/api/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Update issue (admin only)
  updateIssue: (id, data) => API.put(`/api/issues/${id}`, data),
  
  // Delete issue
  deleteIssue: (id) => API.delete(`/api/issues/${id}`),
  
  // Vote on issue
  voteOnIssue: (id, voteType) => API.post(`/api/issues/${id}/vote`, { voteType }),
  
  // Add comment to issue
  addComment: (id, message) => API.post(`/api/issues/${id}/comment`, { message }),
  
  // Get user's reported issues
  getMyIssues: (params = {}) => API.get('/api/issues/user/my-issues', { params }),
  
  // Get issue statistics
  getStats: () => API.get('/api/issues/stats'),
};

// User APIs (Admin only)
export const userAPI = {
  getAllUsers: (params = {}) => API.get('/api/users', { params }),
  getUserById: (id) => API.get(`/api/users/${id}`),
  updateUserRole: (id, role) => API.put(`/api/users/${id}/role`, { role }),
  toggleUserStatus: (id) => API.put(`/api/users/${id}/status`),
  deleteUser: (id) => API.delete(`/api/users/${id}`),
  getDashboardStats: () => API.get('/api/users/dashboard-stats'),
};

// Utility function to handle file uploads
export const uploadFiles = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });
  return formData;
};

// Convenience functions for components (matching expected function names)
export const register = (data) => authAPI.register(data);
export const login = (data) => authAPI.login(data);
export const getProfile = () => authAPI.getProfile();

export const getIssues = (params) => issueAPI.getAllIssues(params);
export const getIssue = (id) => issueAPI.getIssueById(id);
export const createIssue = (data) => issueAPI.createIssue(data);
export const updateIssue = (id, data) => issueAPI.updateIssue(id, data);
export const deleteIssue = (id) => issueAPI.deleteIssue(id);
export const voteOnIssue = (id, voteType) => issueAPI.voteOnIssue(id, voteType);

// Comment functions
export const addComment = (issueId, commentData) => 
  API.post(`/api/issues/${issueId}/comments`, commentData);

export const getComments = (issueId) => 
  API.get(`/api/issues/${issueId}/comments`);

export const updateComment = (issueId, commentId, data) => 
  API.put(`/api/issues/${issueId}/comments/${commentId}`, data);

export const deleteComment = (issueId, commentId) => 
  API.delete(`/api/issues/${issueId}/comments/${commentId}`);

// Issue status management (Admin only)
export const updateIssueStatus = (issueId, statusData) => 
  API.put(`/api/issues/${issueId}/status`, statusData);

export const getIssueHistory = (issueId) => 
  API.get(`/api/issues/${issueId}/history`);

// Analytics and reporting
export const getIssueStats = () => API.get('/api/issues/analytics/stats');
export const getIssuesByLocation = (bounds) => 
  API.get('/api/issues/analytics/location', { params: bounds });
export const getTrendingIssues = (params = {}) => 
  API.get('/api/issues/analytics/trending', { params });

// Admin dashboard functions
export const getAllUsers = (params) => userAPI.getAllUsers(params);
export const getDashboardStats = () => userAPI.getDashboardStats();
export const updateUserRole = (id, role) => userAPI.updateUserRole(id, role);

// Location and mapping utilities
export const reverseGeocode = (lat, lng) => 
  API.get(`/api/geocoding/reverse?lat=${lat}&lng=${lng}`);

export const searchLocations = (query) => 
  API.get(`/api/geocoding/search?q=${encodeURIComponent(query)}`);

export default API;