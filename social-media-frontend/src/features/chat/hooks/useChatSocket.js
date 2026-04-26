import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { backendUrl } from '../../../Utils/backendUrl';
import { useChat } from '../context/ChatContext';

export const useChatSocket = (user) => {
  const socket = useRef(null);
  const { 
    setMessages, 
    setOnlineUsers, 
    setTypingUsers, 
    activeChatId,
    setChats 
  } = useChat();

  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const connectSocket = useCallback(() => {
    if (socket.current) return;

    socket.current = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.current.on('connect', () => {
      console.log('Socket connected:', socket.current.id);
    });

    socket.current.on('update-online-users', (users) => {
      setOnlineUsers(users);
    });

    socket.current.on('message', (msg) => {
      // Use ref to check activeChatId to avoid closure issues
      if (activeChatIdRef.current === msg.chatId) {
        setMessages((prev) => [...prev, msg]);
      }
      
      setChats((prevChats) => {
        const updatedChats = prevChats.map(chat => {
          if (chat.chatId === msg.chatId) {
            return { ...chat, updatedAt: msg.updatedAt };
          }
          return chat;
        });
        return updatedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.current.on('user-typing', (data) => {
      const { chatId, user: typingUser, isTyping } = data;
      setTypingUsers((prev) => {
        const chatTyping = prev[chatId] || {};
        if (isTyping) {
          chatTyping[typingUser] = true;
        } else {
          delete chatTyping[typingUser];
        }
        return { ...prev, [chatId]: { ...chatTyping } };
      });
    });

    socket.current.on('group', (newChat) => {
      setChats((prev) => {
        const exists = prev.find(c => c.chatId === newChat.chatId);
        if (exists) return prev;
        return [newChat, ...prev].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.current.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

  }, [setMessages, setOnlineUsers, setTypingUsers, setChats]);

  useEffect(() => {
    if (user && user.name) {
      connectSocket();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [user, connectSocket]);

  const sendMessage = (messageData) => {
    if (socket.current) {
      socket.current.emit('message', messageData);
    }
  };

  const emitTyping = (chatId, isTyping) => {
    if (socket.current) {
      socket.current.emit('typing', { chatId, isTyping });
    }
  };

  const emitGroup = (groupData) => {
    if (socket.current) {
      socket.current.emit('group', groupData);
    }
  };

  return { sendMessage, emitTyping, emitGroup };
};
