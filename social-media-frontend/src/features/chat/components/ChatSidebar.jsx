import React from 'react';
import { Search, AddCircle } from '@mui/icons-material';
import { useChat } from '../context/ChatContext';
import ChatList from './ChatList';
import styles from '../styles/Chat.module.css';

const ChatSidebar = ({ onSearchClick, onCreateGroupClick }) => {
  const { chats, activeChatId, setActiveChatId, onlineUsers } = useChat();

  return (
    <div className={styles.Sidebar}>
      <div className={styles.ActionButtons}>
        <button className={styles.ActionButton} onClick={onSearchClick}>
          <Search /> Search Chat
        </button>
        <button className={styles.ActionButton} onClick={onCreateGroupClick}>
          <AddCircle /> Create Group
        </button>
      </div>
      
      <ChatList 
        chats={chats} 
        activeChatId={activeChatId} 
        onChatSelect={setActiveChatId} 
        onlineUsers={onlineUsers} 
      />
    </div>
  );
};

export default ChatSidebar;
