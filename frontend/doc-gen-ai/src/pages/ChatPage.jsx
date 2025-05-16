import React, { useState, useEffect, useRef, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  FileUp,
  FileText,
  CornerDownLeft,
  User,
  Bot,
  ArrowLeft,
  Paperclip,
  MoreVertical,
  Loader,
  Info,
  Download,
  File,
  FileQuestion,
  PenSquare,
  Calendar,
  X
} from 'lucide-react';

const ChatPage = ({ isNew = false }) => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { getChat, createNewChat, sendMessage, currentChat, setCurrentChat } = useChat();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Handle initial chat loading
  useEffect(() => {
    if (isNew) {
      setCurrentChat(null);
    } else if (chatId) {
      const chat = getChat(chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        // Chat not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [chatId, isNew, getChat, setCurrentChat, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Handle document upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'html'];

    if (!allowedTypes.includes(fileExt)) {
      alert('Please upload a supported file type (PDF, DOC, DOCX, TXT, HTML)');
      return;
    }

    console.log('it called');
    
    try {
      setIsUploading(true);
      // Step 1: Create FormData and append the file and user_id
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user._id);  // Send the user_id as part of the FormData
      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/chat/create`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error uploading file');
      }
      const upload = await uploadResponse.json();
      // const fileUrl = uploadData.url;
      console.log(upload);

      const details = {
        name: file.name,
        type: fileExt,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
      };

      setDocumentDetails(details);
      if (isNew) {
        navigate(`/chat/${newChat.id}`);
      }


    } catch (error) {
      console.error("Error during file upload or chat creation:", error);
      alert('Error uploading file or creating chat');
    } finally {
      setIsUploading(false);  // Hide loading state after completion
    }



    // setDocumentDetails(details);

    // // Create new chat with the uploaded document
    // const newChat = createNewChat(
    //   file.name,
    //   fileExt,
    //   URL.createObjectURL(file) // In a real app, this would be a URL from your server
    // );

    setIsUploading(false);


    // }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !currentChat) return;

    const trimmedMessage = message.trim();
    setMessage('');

    await sendMessage(trimmedMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file icon based on document type
  const getFileIcon = (documentType) => {
    if (!documentType) return <FileText className="text-slate-400" />;

    switch (documentType.toLowerCase()) {
      case 'pdf':
        return <FileText className="text-red-400" />;
      case 'docx':
      case 'doc':
        return <File className="text-blue-400" />;
      case 'txt':
        return <PenSquare className="text-green-400" />;
      case 'html':
        return <FileQuestion className="text-orange-400" />;
      default:
        return <FileText className="text-slate-400" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Render upload screen if no current chat or new chat
  if (!currentChat || isNew) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-slate-100">New Chat</h1>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            {isUploading ? (
              <div className="card p-8">
                <Loader size={48} className="text-primary-500 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Uploading Document</h2>
                <p className="text-slate-400 mb-4">Please wait while we process your document...</p>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : documentDetails ? (
              <div className="card p-8">
                <div className="flex items-center justify-center mb-6">
                  {getFileIcon(documentDetails.type)}
                  <span className="text-xl font-semibold ml-2">{documentDetails.name}</span>
                </div>
                <p className="text-slate-400 mb-6">Your document has been uploaded successfully!</p>
                <button
                  className="btn-primary w-full"
                  onClick={() => setIsUploading(false)}
                >
                  Continue to Chat
                </button>
              </div>
            ) : (
              <>
                <div
                  className="card p-8 border-2 border-dashed border-slate-700 hover:border-primary-500 transition-colors duration-200 cursor-pointer mb-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp size={48} className="text-slate-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Upload a Document</h2>
                  <p className="text-slate-400 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supported formats: PDF, DOC, DOCX, TXT, HTML (Max 20MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.html"
                  />
                </div>
                <div className="text-slate-500 text-sm">
                  Or try one of our sample documents:
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button className="card p-4 hover:border-primary-500 transition-colors duration-200 flex items-center">
                    <FileText size={16} className="text-red-400 mr-2" />
                    <span className="text-sm">Sample Report.pdf</span>
                  </button>
                  <button className="card p-4 hover:border-primary-500 transition-colors duration-200 flex items-center">
                    <File size={16} className="text-blue-400 mr-2" />
                    <span className="text-sm">User Manual.docx</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-slate-400 hover:text-slate-200 lg:hidden"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center">
              {getFileIcon(currentChat.documentType)}
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-slate-100">{currentChat.title}</h1>
                <p className="text-xs text-slate-500">{currentChat.documentName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
              onClick={() => setShowDocumentInfo(!showDocumentInfo)}
            >
              <Info size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
        {currentChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex items-start max-w-[80%] lg:max-w-[70%]
              ${msg.sender === 'user' ? 'bg-primary-900/40 text-slate-100' : 'bg-dark-100 text-slate-200'}
              p-3 rounded-lg
            `}>
              <div className={`
                p-1.5 rounded-full mr-2 shrink-0 mt-0.5
                ${msg.sender === 'user' ? 'bg-primary-700/50' : 'bg-slate-700/50'}
              `}>
                {msg.sender === 'user' ? (
                  <User size={16} className="text-primary-300" />
                ) : (
                  <Bot size={16} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm prose-invert">
                  {msg.content}
                </div>
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {formatDate(msg.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-800 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your document..."
              className="input py-3 min-h-[60px] max-h-[180px] resize-none pr-12"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.html"
                />
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary h-[60px] aspect-square flex items-center justify-center"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-2 text-xs text-slate-500">
          <div>
            <span className="inline-flex items-center">
              <CornerDownLeft size={14} className="mr-1" /> Press Enter to send
            </span>
          </div>
          <div>
            <span>{currentChat.messages.length} messages in this conversation</span>
          </div>
        </div>
      </div>

      {/* Document Info Sidebar */}
      {showDocumentInfo && (
        <div className="fixed right-0 top-0 h-full w-80 bg-dark-200 border-l border-slate-800 z-40 overflow-y-auto transition-transform duration-300 ease-in-out">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Document Details</h2>
            <button
              className="text-slate-400 hover:text-slate-200"
              onClick={() => setShowDocumentInfo(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex justify-center mb-6">
              {getFileIcon(currentChat.documentType)}
            </div>

            <h3 className="text-xl font-medium text-center mb-6">{currentChat.documentName}</h3>

            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-400">Type</span>
                <span className="text-slate-200">{currentChat.documentType?.toUpperCase() || 'Document'}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-400">Size</span>
                <span className="text-slate-200">{formatFileSize(125000)}</span>
              </div>

              <div className="flex items-start justify-between text-sm">
                <span className="text-slate-400">Created</span>
                <span className="text-slate-200 text-right">{formatDate(currentChat.createdAt)}</span>
              </div>
            </div>

            <div className="card p-4 mb-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Document Summary</h4>
              <p className="text-sm text-slate-400">
                This document contains important information related to the project specifications
                and requirements. It includes details about timelines, resources, and deliverables.
              </p>
            </div>

            <button className="btn-outline w-full flex items-center justify-center gap-2">
              <Download size={16} />
              <span>Download Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay for document info sidebar on mobile */}
      {showDocumentInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowDocumentInfo(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;