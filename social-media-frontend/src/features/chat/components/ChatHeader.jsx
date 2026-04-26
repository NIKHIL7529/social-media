import React from 'react';
import { AccountCircle, Groups } from '@mui/icons-material';
import styles from '../styles/Chat.module.css';

const ChatHeader = ({ activeChat }) => {
  return (
    <div className={styles.WindowHeader}>
      <div className={styles.AvatarWrapper}>
        {activeChat.group ? <Groups /> : <AccountCircle />}
      </div>
      <div className={styles.ChatTitle}>
        <h3>{activeChat.name || activeChat.users[0]}</h3>
        {activeChat.group && <p>{activeChat.users.length} members</p>}
      </div>
    </div>
  );
};

export default ChatHeader;
