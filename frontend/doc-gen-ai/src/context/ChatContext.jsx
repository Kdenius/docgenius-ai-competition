import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
export const ChatContext = createContext(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // Load chats from localStorage
  useEffect(() => {
    if (user) {
      const storedChats = localStorage.getItem('docgenius_chats');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      }
    } else {
      setChats([]);
      setCurrentChat(null);
    }
  }, [user]);

  // Save chats to localStorage when they change
  useEffect(() => {
    if (user && chats.length > 0) {
      localStorage.setItem('docgenius_chats', JSON.stringify(chats));
    }
  }, [chats, user]);

  const createNewChat = (documentName, documentType, documentUrl) => {
    const newChat = {
      id: `chat_${Date.now()}`,
      title: documentName.split('.')[0] || 'New Chat',
      documentName,
      documentType,
      documentUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          content: `I've analyzed your document: ${documentName}. What would you like to know about it?`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        }
      ]
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChat(newChat);
    
    return newChat;
  };

  const sendMessage = async (content) => {
    if (!currentChat) return;
    
    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Update current chat with user message
    const updatedChat = {
      ...currentChat,
      updatedAt: new Date().toISOString(),
      messages: [...currentChat.messages, userMessage],
    };
    
    setCurrentChat(updatedChat);
    
    // Update chats list
    setChats(prevChats => 
      prevChats.map(chat => chat.id === currentChat.id ? updatedChat : chat)
    );
    
    // Simulate AI response (1-2 second delay)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Sample AI responses
    const aiResponses = [
      "Based on the document, I can confirm that information is correct.",
      "The document doesn't specifically mention that, but it implies that...",
      "According to page 3 of the document, the relevant information states...",
      "That's a great question! The document addresses this in section 2.1, explaining that...",
      "I found several references to that in the document. The main points are...",
    ];
    
    // Select random response
    const aiContent = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    // Add AI response
    const aiMessage = {
      id: `msg_${Date.now()}`,
      content: aiContent,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };
    
    // Update current chat with AI message
    const finalUpdatedChat = {
      ...updatedChat,
      messages: [...updatedChat.messages, aiMessage],
    };
    
    setCurrentChat(finalUpdatedChat);
    
    // Update chats list
    setChats(prevChats => 
      prevChats.map(chat => chat.id === currentChat.id ? finalUpdatedChat : chat)
    );
  };

  const getChat = (chatId) => {
    return chats.find(chat => chat.id === chatId);
  };

  const deleteChat = (chatId) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null);
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      setCurrentChat,
      createNewChat,
      sendMessage,
      getChat,
      deleteChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};