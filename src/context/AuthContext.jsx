import { createContext, useState, useContext, useLayoutEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === 'undefined' || savedToken === 'null' || savedToken === '[object Object]') {
      return null;
    }
    // Deep-clean the token in case it was previously corrupted
    let cleanToken = savedToken.replace(/['"]+/g, '');
    if (cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.replace('Bearer ', '');
    }
    return cleanToken;
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
    // 🛡️ MASTER REQUEST INTERCEPTOR
    const reqInterceptor = axios.interceptors.request.use((config) => {
      let currentToken = localStorage.getItem('token');

      // Ensure headers object exists
      config.headers = config.headers || {};

      if (currentToken && currentToken !== 'undefined' && currentToken !== 'null' && currentToken !== '[object Object]') {
        // Deep-clean the token before attaching it to the header
        currentToken = currentToken.replace(/['"]+/g, '');
        if (currentToken.startsWith('Bearer ')) {
            currentToken = currentToken.replace('Bearer ', '');
        }
        config.headers['Authorization'] = `Bearer ${currentToken}`;
      } else {
         // Safely delete if it somehow exists but the token is null
         if (config.headers['Authorization']) {
             delete config.headers['Authorization'];
         }
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

    // Clean token before saving it to localStorage
    let cleanToken = String(newToken).replace(/['"]+/g, '');
    if (cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.replace('Bearer ', '');
    }

    localStorage.setItem('token', cleanToken);
    localStorage.setItem('user', JSON.stringify(userData || {}));
    setToken(cleanToken);
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