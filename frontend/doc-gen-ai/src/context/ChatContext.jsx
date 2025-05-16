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

  const createNewChat = (upload) => {
    // const randomCode = Math.floor(100000 + Math.random() * 900000);
    const newChat = {
      _id: upload._id,
      doc_summary: upload.doc_summary,
      size: upload.size,
      type: upload.type,
      document_path : upload.document_path,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChat(newChat);
    
    return newChat;
  };

  const sendMessage = async (content) => {
  if (!currentChat) return;

  // // Add user message
  // const userMessage = {
  //   chat_id: currentChat._id,
  //   text: content,
  //   answer:null,
  //   timestamp: new Date().toISOString
  // };

  // // Update current chat immediately with the user message
  // const updatedChat = {
  //   ...currentChat,
  //   updatedAt: new Date().toISOString(),
  //   messages: [...currentChat.messages, userMessage],
  // };

  // setCurrentChat(updatedChat);
  // setChats(prevChats =>
  //   prevChats.map(chat =>
  //     chat._id === currentChat._id ? updatedChat : chat
  //   )
  // );

  try {
    // Send POST request with chat_id and text to the API
    const response = await fetch(import.meta.env.VITE_API_URL+'/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: currentChat._id,
        text: content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    // Expected API response: { _id, text, answer, timestamp }
    const data = await response.json();
    console.log(data);

    // Append the AI message to the chat messages array
    const finalUpdatedChat = {
      ...currentChat,
      updatedAt: new Date().toISOString(),
      messages: [...currentChat.messages, data],
    };

    // // Update state with the new chat messages that include the AI's reply
    setCurrentChat(finalUpdatedChat);
    setChats(prevChats =>
      prevChats.map(chat =>
        chat._id === currentChat._id ? finalUpdatedChat : chat
      )
    );
  } catch (error) {
    console.error('Error sending message:', error);
    // Optionally, display error feedback to the user here
  }
};

  const getChat = (chatId) => {
    return chats.find(chat => chat._id === chatId);
  };

  const deleteChat = async (chatId) => {
  try {
    // Get user ID from props or context
    const userId = user._id;

    // Send DELETE request to backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/delete?chat_id=${chatId}&user_id=${userId}`, {
      method: 'DELETE',
    });

    // Check if the response is OK (status 200)
    if (response.ok) {
      // Remove the chat from the state if the delete was successful
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));

      // If the current chat is the one that was deleted, clear it
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat(null);
      }
      localStorage.setItem('docgenius_chats', JSON.stringify(chats));
      // Optionally, show a success message
      console.log("Chat deleted successfully!");
    } else {
      // Handle any error responses from the server
      const errorData = await response.json();
      console.error("Error deleting chat:", errorData.message);
    }
  } catch (error) {
    console.error("Failed to delete chat:", error);
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