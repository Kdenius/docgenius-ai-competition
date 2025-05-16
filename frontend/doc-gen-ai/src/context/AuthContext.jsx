import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();


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

      // Make API request to FastAPI backend
      const response = await fetch(import.meta.env.VITE_API_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is OK
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message);
      }

      // Parse JSON response
      const data = await response.json();
      console.log(data)

      // Store user data in localStorage
      setUser(data);
      localStorage.setItem("docgenius_user", JSON.stringify({ ...data }));
      localStorage.setItem("docgenius_chats", JSON.stringify(data.chats));
      // setUser(JSON.parse(data.user))
      // navigate('/dashboard');


    } finally {
      setLoading(false);
    }
  };
  // Mock signup function
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      // Simulate API call
      const response = await fetch(import.meta.env.VITE_API_URL + '/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message);
      }

      // const data = await response.json();

      // Assuming the API responds with success or error messages
      // if (data.success) {
      //   setUser({
      //     id: `user_${Date.now()}`,
      //     name,
      //     email,
      //   });
      //   localStorage.setItem('docgenius_user', JSON.stringify({ name, email }));
      alert('Signup successful! Please check your email for verification.');
      // } else {
      //   throw new Error(data.message || 'Failed to create account.');
      // }

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