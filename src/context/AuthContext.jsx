import { createContext, useState, useContext, useLayoutEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      return null;
    }
  });

  useLayoutEffect(() => {
    // 🛡️ MASTER REQUEST INTERCEPTOR: Aggressive Token Sanitizer
    const reqInterceptor = axios.interceptors.request.use((config) => {
      let currentToken = localStorage.getItem('token');
      config.headers = config.headers || {};
      
      if (currentToken && currentToken !== 'undefined' && currentToken !== 'null') {
        // Brutally scrub the token of any accidental quotes or double 'Bearer' prefixes
        currentToken = String(currentToken).replace(/['"]+/g, '');
        if (currentToken.startsWith('Bearer ')) {
            currentToken = currentToken.replace('Bearer ', '');
        }
        config.headers['Authorization'] = `Bearer ${currentToken}`;
      } else {
        delete config.headers['Authorization'];
      }
      return config;
    });

    // 🛡️ MASTER RESPONSE INTERCEPTOR: Silent Session Cleanup
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Ignore errors from the login/register routes themselves
        const isAuthRequest = error.config && error.config.url && 
          (error.config.url.includes('/login') || error.config.url.includes('/register'));

        // If the backend rejects the token (401 or 422) during normal app usage, log them out silently
        if (!isAuthRequest && error.response && (error.response.status === 401 || error.response.status === 422)) {
          console.warn("Session expired or invalid. Purging cache.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = (newToken, userData) => {
    if (!newToken || newToken === 'undefined' || newToken === 'null') return;
    
    // Clean token before saving to local storage
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
    window.location.href = '/auth';
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