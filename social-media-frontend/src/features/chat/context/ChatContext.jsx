import React, { createContext, useContext, useState, useMemo } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: { userName: true } }

  const activeChat = useMemo(() => {
    return chats.find(chat => chat.chatId === activeChatId) || null;
  }, [chats, activeChatId]);

  const value = {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    activeChat,
    messages,
    setMessages,
    onlineUsers,
    setOnlineUsers,
    typingUsers,
    setTypingUsers,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
