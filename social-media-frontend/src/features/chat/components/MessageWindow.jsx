import React from 'react';
import { Forum } from '@mui/icons-material';
import { useChat } from '../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from '../styles/Chat.module.css';

const MessageWindow = ({ onSendMessage, onTyping }) => {
  const { activeChat, messages, activeChatId, typingUsers } = useChat();

  const chatTyping = typingUsers[activeChatId] || {};
  const typingDisplay = Object.keys(chatTyping).join(', ');

  if (!activeChat) {
    return (
      <div className={styles.PlaceholderWindow}>
        <Forum />
        <h3>Your Messages</h3>
        <p>Select a contact or group to start chatting.</p>
      </div>
    );
  }

  return (
    <div className={styles.ChatWindow}>
      <ChatHeader activeChat={activeChat} />
      
      <MessageList 
        messages={messages} 
        activeChat={activeChat} 
        typingDisplay={typingDisplay} 
      />

      <MessageInput 
        onSendMessage={onSendMessage} 
        onTyping={onTyping} 
        activeChatId={activeChatId} 
      />
    </div>
  );
};

export default MessageWindow;
