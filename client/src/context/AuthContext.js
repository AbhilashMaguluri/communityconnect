import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AuthActions = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAIL: 'LOAD_USER_FAIL',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case AuthActions.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case AuthActions.LOAD_USER_FAIL:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    
    case AuthActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AuthActions.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on initial load
  useEffect(() => {
    loadUser();
  }, []);

  // Load user function
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: AuthActions.LOAD_USER_FAIL });
        return;
      }

      const response = await authAPI.getProfile();
      
      dispatch({
        type: AuthActions.LOAD_USER_SUCCESS,
        payload: response.data.data,
      });
      
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      dispatch({
        type: AuthActions.LOAD_USER_FAIL,
        payload: error.response?.data?.message || 'Failed to load user',
      });
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      
      const response = await authAPI.login(credentials);
      const { token, ...userData } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user: userData, token },
      });
      
      toast.success('Login successful!');
      return { success: true };
      
    } catch (error) {
      dispatch({
        type: AuthActions.LOAD_USER_FAIL,
        payload: error.response?.data?.message || 'Login failed',
      });
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      
      const response = await authAPI.register(userData);
      const { token, ...user } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user, token },
      });
      
      toast.success('Registration successful!');
      return { success: true };
      
    } catch (error) {
      dispatch({
        type: AuthActions.LOAD_USER_FAIL,
        payload: error.response?.data?.message || 'Registration failed',
      });
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: AuthActions.LOGOUT });
    toast.success('Logged out successfully!');
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      dispatch({
        type: AuthActions.UPDATE_PROFILE_SUCCESS,
        payload: response.data.data,
      });
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      toast.success('Profile updated successfully!');
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  // Clear errors
  const clearError = useCallback(() => {
    dispatch({ type: AuthActions.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loadUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;