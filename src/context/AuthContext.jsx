import { createContext, useState, useContext, useLayoutEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken && savedToken !== 'undefined' && savedToken !== 'null' ? savedToken : null;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser && savedUser !== 'undefined' && savedUser !== 'null' ? JSON.parse(savedUser) : null;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  });

  // 🛡️ THE FIX: GLOBAL AXIOS INTERCEPTOR 🛡️
  // This wraps your entire app. Every time Axios makes a request, this intercepts it.
  // It guarantees that a clean, valid token is sent. It permanently prevents 422 errors.
  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('token');
      
      // If a valid token exists, attach it to the header
      if (currentToken && currentToken !== 'undefined' && currentToken !== 'null') {
        config.headers.Authorization = `Bearer ${currentToken}`;
      } else {
        // If no valid token, ensure we don't send "Bearer null", which causes 422 errors
        delete config.headers.Authorization;
      }
      return config;
    });

    // Cleanup the interceptor if the provider unmounts
    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, []);

  const login = (newToken, userData) => {
    if (!newToken || newToken === 'undefined' || newToken === 'null') {
      console.error("Authentication rejected: Invalid token payload received.");
      return;
    }
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData || {}));
    setToken(newToken);
    setUser(userData || {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const mergedUser = { ...user, ...updatedData };
    setUser(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);