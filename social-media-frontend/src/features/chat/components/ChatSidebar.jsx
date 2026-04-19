import React from 'react';
import { AccountCircle, Groups, Search, AddCircle } from '@mui/icons-material';
import { useChat } from '../context/ChatContext';
import styles from '../styles/Chat.module.css';

const ChatSidebar = ({ onSearchClick, onCreateGroupClick }) => {
  const { chats, activeChatId, setActiveChatId, onlineUsers } = useChat();

  const isOnline = (chat) => {
    if (chat.group) return false;
    const otherUserName = chat.users[0];
    return onlineUsers.some(u => u.user.name === otherUserName);
  };

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
      
      <div className={styles.ChatList}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.chatId}
              className={`${styles.ChatItem} ${activeChatId === chat.chatId ? styles.ActiveChat : ''}`}
              onClick={() => setActiveChatId(chat.chatId)}
            >
              <div className={styles.AvatarWrapper}>
                {chat.group ? <Groups /> : <AccountCircle />}
                {isOnline(chat) && <div className={styles.OnlineBadge} />}
              </div>
              <div className={styles.ChatInfo}>
                <div className={styles.ChatName}>
                  {chat.name || (chat.users.length > 0 ? chat.users[0] : 'Unknown')}
                </div>
                {isOnline(chat) && <div className={styles.StatusText}>Online</div>}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.EmptyState}>No active conversations</div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
