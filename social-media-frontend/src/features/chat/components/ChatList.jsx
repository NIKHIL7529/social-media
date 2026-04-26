import React from 'react';
import ChatItem from './ChatItem';
import styles from '../styles/Chat.module.css';

const ChatList = ({ chats, activeChatId, onChatSelect, onlineUsers }) => {
  const isUserOnline = (chat) => {
    if (chat.group) return false;
    const otherUserName = chat.users[0];
    return onlineUsers.some(u => u.user.name === otherUserName);
  };

  return (
    <div className={styles.ChatList}>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <ChatItem
            key={chat.chatId}
            chat={chat}
            isActive={activeChatId === chat.chatId}
            onClick={() => onChatSelect(chat.chatId)}
            isOnline={isUserOnline(chat)}
          />
        ))
      ) : (
        <div className={styles.EmptyState}>No active conversations</div>
      )}
    </div>
  );
};

export default ChatList;
