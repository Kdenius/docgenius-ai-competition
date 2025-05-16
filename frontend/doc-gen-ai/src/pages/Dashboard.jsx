import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Search, 
  PlusCircle,
  File,
  FileQuestion,
  BarChart,
  Layers,
  PenSquare
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { chats } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter chats based on search term
  const filteredChats = searchTerm
    ? chats.filter(chat => 
        chat.document_path.split('/').pop().toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.document_path.split('/').pop().toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chats;

  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get file icon based on document type
  const getFileIcon = (documentType) => {
    switch (documentType.toLowerCase()) {
      case 'pdf':
        return <FileText className="text-red-400" size={24} />;
      case 'docx':
      case 'doc':
        return <File className="text-blue-400" size={24} />;
      case 'txt':
        return <PenSquare className="text-green-400" size={24} />;
      case 'html':
        return <FileQuestion className="text-orange-400" size={24} />;
      default:
        return <Layers className="text-purple-400" size={24} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-slate-100">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.name}</p>
      </div>

      {/* Search and New Chat */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/chat/new" className="btn-primary flex items-center justify-center gap-2 md:w-auto">
          <PlusCircle size={18} />
          <span>New Chat</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary-900/50 text-primary-400 p-3 rounded-lg">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-slate-400 text-sm font-medium">Total Chats</h3>
              <p className="text-2xl font-bold text-slate-100">{chats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/50 text-blue-400 p-3 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-slate-400 text-sm font-medium">Documents</h3>
              <p className="text-2xl font-bold text-slate-100">{chats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-900/50 text-green-400 p-3 rounded-lg">
              <BarChart size={24} />
            </div>
            <div>
              <h3 className="text-slate-400 text-sm font-medium">Created Today</h3>
              <p className="text-2xl font-bold text-slate-100">
                {chats.filter(chat => {
                  const today = new Date().toDateString();
                  const chatDate = new Date(chat.timestamp).toDateString();
                  return today === chatDate;
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-900/50 text-orange-400 p-3 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-slate-400 text-sm font-medium">Recent Activity</h3>
              <p className="text-2xl font-bold text-slate-100">
                {chats.length > 0 ? (
                  formatDate(chats[0].timestamp)
                ) : (
                  "No activity"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-100">Recent Documents</h2>
        
        {filteredChats.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No documents yet</h3>
            <p className="text-slate-400 mb-6">Upload a document to start chatting with DocGenius AI</p>
            <Link to="/chat/new" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle size={18} />
              <span>New Chat</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChats.map((chat, index) => (
              <Link 
                key={chat._id || index}
                to={`/chat/${chat._id}`}
                className="card hover:border-primary-700 transition-all duration-200 group overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    {getFileIcon(chat.type)}
                    <span className="text-xs text-slate-400 bg-dark-200 px-2 py-1 rounded">
                      {chat.type?.toUpperCase() || 'DOCUMENT'}
                    </span>
                  </div>
                  <h3 className="font-medium text-lg mb-1 text-slate-200 group-hover:text-primary-300 transition-colors duration-200 truncate">
                    {chat.document_path.split('/').pop()}
                  </h3>
                  <p className="text-sm text-slate-400 truncate mb-3">
                    {chat.document_path.split('/').pop()}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {chat.messages.length} messages
                    </span>
                    <span>{formatDate(chat.timestamp)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-r from-primary-700 to-primary-500 transform translate-y-1.5 group-hover:translate-y-0 transition-transform duration-200"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;