import axios from 'axios';

// Set base URL for API requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const apiTest = () => api.get('/api/test');
export const getIssues = () => api.get('/api/issues');
export const getIssue = (id) => api.get(`/api/issues/${id}`);
export const createIssue = (issueData, images) => {
  const formData = new FormData();
  
  // Add all issue fields to FormData
  Object.keys(issueData).forEach(key => {
    if (key === 'location') {
      formData.append(key, JSON.stringify(issueData[key]));
    } else {
      formData.append(key, issueData[key]);
    }
  });
  
  // Add images if any
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      formData.append('images', image);
    });
  }
  
  return api.post('/api/issues', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const voteOnIssue = (id, voteType) => api.post(`/api/issues/${id}/vote`, { voteType });
export const addComment = (id, text) => api.post(`/api/issues/${id}/comment`, { text });
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const getCurrentUser = () => api.get('/api/auth/user');

export default api;