import { createContext, useState, useContext, useLayoutEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === 'undefined' || savedToken === 'null' || savedToken === '[object Object]') {
      return null;
    }
    return savedToken;
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

  useLayoutEffect(() => {
    // 🛡️ REQUEST INTERCEPTOR ONLY
    // Safely attaches the token to outgoing requests but does NOT force reloads
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && currentToken !== 'undefined' && currentToken !== 'null' && currentToken !== '[object Object]') {
        config.headers.Authorization = `Bearer ${currentToken}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
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