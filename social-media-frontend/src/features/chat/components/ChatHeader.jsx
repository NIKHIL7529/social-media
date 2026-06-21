import React from 'react';
import { AccountCircle, Groups } from '@mui/icons-material';
import styles from '../styles/Chat.module.css';

const ChatHeader = ({ activeChat, connectionState }) => {
  const statusText = {
    connected: 'Live',
    connecting: 'Connecting...',
    disconnected: 'Reconnecting...',
    error: 'Connection unavailable',
  }[connectionState];

  return (
    <div className={styles.WindowHeader}>
      <div className={styles.AvatarWrapper}>
        {activeChat.group ? <Groups /> : <AccountCircle />}
      </div>
      <div className={styles.ChatTitle}>
        <h3>{activeChat.name || activeChat.users[0]}</h3>
        <p className={connectionState === 'connected' ? styles.LiveStatus : styles.OfflineStatus}>
          {activeChat.group ? `${activeChat.users.length} members · ` : ''}
          {statusText}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
