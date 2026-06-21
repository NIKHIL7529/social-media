import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';
import { backendUrl } from '../../../Utils/backendUrl';
import { useChat } from '../context/ChatContext';

export const useChatSocket = (user) => {
  const socket = useRef(null);
  const [connectionState, setConnectionState] = useState('disconnected');
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
    setConnectionState('connecting');

    socket.current.on('connect', () => {
      setConnectionState('connected');
    });

    socket.current.on('disconnect', () => {
      setConnectionState('disconnected');
    });

    socket.current.on('update-online-users', (users) => {
      setOnlineUsers(users);
    });

    socket.current.on('message', (msg) => {
      const incomingMessage = {
        ...msg,
        isMine: msg.sender === user?.name,
      };

      // Use ref to check activeChatId to avoid closure issues
      if (activeChatIdRef.current === msg.chatId) {
        setMessages((prev) => [...prev, incomingMessage]);
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
      setConnectionState('error');
      if (err.message.startsWith('Authentication error:')) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    });

  }, [setMessages, setOnlineUsers, setTypingUsers, setChats, user?.name]);

  useEffect(() => {
    if (user && user.name) {
      connectSocket();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      setConnectionState('disconnected');
    };
  }, [user?.name, connectSocket]);

  const sendMessage = (messageData) => {
    if (socket.current?.connected) {
      socket.current.emit('message', messageData);
      return true;
    }
    return false;
  };

  const emitTyping = (chatId, isTyping, receiver) => {
    if (socket.current?.connected) {
      socket.current.emit('typing', { chatId, isTyping, receiver });
    }
  };

  const emitGroup = (groupData) => {
    if (socket.current?.connected) {
      socket.current.emit('group', groupData);
      return true;
    }
    return false;
  };

  return { sendMessage, emitTyping, emitGroup, connectionState };
};
