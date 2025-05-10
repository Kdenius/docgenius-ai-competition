import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChatProvider } from '../context/ChatContext';
import React from 'react';

const Layout = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </ChatProvider>
  );
};

export default Layout;