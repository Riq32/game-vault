import { createContext, useState, useContext } from 'react';

// Create the Context
const AuthContext = createContext();

// Create the Provider Component
export function AuthProvider({ children }) {
  // Initialize state directly from localStorage so it persists on page refresh
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Global Login Function
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Global Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to make it easy to use the context in any component
export const useAuth = () => {
  return useContext(AuthContext);
};