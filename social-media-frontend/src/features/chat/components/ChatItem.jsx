import React from 'react';
import { AccountCircle, Groups } from '@mui/icons-material';
import styles from '../styles/Chat.module.css';

const ChatItem = ({ chat, isActive, onClick, isOnline }) => {
  return (
    <div
      className={`${styles.ChatItem} ${isActive ? styles.ActiveChat : ''}`}
      onClick={onClick}
    >
      <div className={styles.AvatarWrapper}>
        {chat.group ? <Groups /> : <AccountCircle />}
        {isOnline && <div className={styles.OnlineBadge} />}
      </div>
      <div className={styles.ChatInfo}>
        <div className={styles.ChatName}>
          {chat.name || (chat.users.length > 0 ? chat.users[0] : 'Unknown')}
        </div>
        <div className={isOnline ? styles.StatusText : styles.MessagePreview}>
          {isOnline ? 'Online' : chat.lastMessage?.message || 'No messages yet'}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
