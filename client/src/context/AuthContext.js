import { createContext, useState, useEffect, useContext } from "react";
import API, { authAPI } from "../services/api";

const AuthContext = createContext(); // default context

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [error, setError] = useState(null);

  // derived boolean for convenience in UI components
  const isAuthenticated = !!user || !!token;

  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await authAPI.getProfile();
      const userData = res?.data?.user || res?.data?.data || null;
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  // Accept either (email, password) or a single credentials object { email, password }
  const login = async (emailOrCredentials, maybePassword) => {
    try {
      setError(null);
      const creds = typeof emailOrCredentials === 'object'
        ? emailOrCredentials
        : { email: emailOrCredentials, password: maybePassword };

      const res = await authAPI.login(creds);
      const token = res?.data?.token || res?.data?.data?.token;
      const userData = res?.data?.user || res?.data?.data?.user || null;
      if (token) {
        localStorage.setItem("token", token);
        setToken(token);
        setUser(userData);
        return { success: true, user: userData };
      }

      // If login response did not include a token, return a failure shape
      return { success: false, message: res?.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Accept an object with registration fields or individual params
  const register = async (userData) => {
    try {
      setError(null);
      const res = await authAPI.register(userData);
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook (for easy usage)
export const useAuth = () => useContext(AuthContext);

// ✅ Default export (for files importing `AuthContext` directly)
export default AuthContext;
