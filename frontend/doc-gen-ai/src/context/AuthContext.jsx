import React, { createContext, useContext, useState, useEffect } from 'react';
React
const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('docgenius_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, just check if email contains '@' and password length > 5
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      const mockUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
      };
      
      setUser(mockUser);
      localStorage.setItem('docgenius_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  // Mock signup function
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!name || !email.includes('@') || password.length < 6) {
        throw new Error('Invalid signup details');
      }
      
      const mockUser = {
        id: `user_${Date.now()}`,
        name,
        email,
      };
      
      setUser(mockUser);
      localStorage.setItem('docgenius_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('docgenius_user');
    localStorage.removeItem('docgenius_chats');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};