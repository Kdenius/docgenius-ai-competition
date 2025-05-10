import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';

function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Set page title based on route
  useEffect(() => {
    const title = getPageTitle(location.pathname);
    document.title = `${title} | DocGenius AI`;
  }, [location]);

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
      
      {/* Protected routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/chat/new" element={<ChatPage isNew={true} />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function getPageTitle(pathname) {
  switch (pathname) {
    case '/login':
      return 'Login';
    case '/signup':
      return 'Sign Up';
    case '/dashboard':
      return 'Dashboard';
    default:
      if (pathname.includes('/chat/')) {
        return 'Chat';
      }
      return 'Smart Document Assistant';
  }
}

export default App;