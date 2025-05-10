import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Trash2,
  User,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { chats, deleteChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChatDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
      if (location.pathname.includes(chatId)) {
        navigate('/dashboard');
      }
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Format relative time (e.g. "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-dark-100 rounded-md lg:hidden"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out bg-dark-200 border-r border-slate-800
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:w-64 lg:shrink-0
      `}>
        {/* Logo Area */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2 px-4">
            <FileText className="text-primary-500" size={24} />
            <h1 className="text-xl font-bold text-gradient">DocGenius AI</h1>
          </Link>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-primary-900 text-primary-300 p-2 rounded-full">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="px-3 py-4">
            <Link 
              to="/dashboard" 
              className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/chat/new" 
              className={`sidebar-item mt-2 ${location.pathname === '/chat/new' ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>New Chat</span>
            </Link>
            
            {/* Recent Chats */}
            {chats.length > 0 && (
              <div className="mt-6">
                <h2 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Chats
                </h2>
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  {chats.map(chat => (
                    <Link
                      key={chat.id}
                      to={`/chat/${chat.id}`}
                      className={`group flex items-start gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-dark-100 rounded-md transition-all duration-200 ${
                        location.pathname === `/chat/${chat.id}` ? 'bg-primary-900/50 text-primary-300' : ''
                      }`}
                    >
                      <MessageSquare size={16} className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{chat.title}</p>
                          <button 
                            onClick={(e) => handleChatDelete(e, chat.id)}
                            className="hidden group-hover:block text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{chat.documentName}</p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(chat.updatedAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Actions */}
          <div className="mt-auto border-t border-slate-800 p-4">
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-dark-100 rounded-md transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;