import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import styles from '../styles/Chat.module.css';

const MessageList = ({ messages, activeChat, typingDisplay }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingDisplay]);

  return (
    <>
      <div className={styles.MessageList} ref={scrollRef}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div 
              key={msg._id || index} 
              className={`${styles.MessageBubble} ${msg.isMine ? styles.Mine : styles.Theirs}`}
            >
              {!msg.isMine && activeChat.group && <span className={styles.SenderName}>{msg.sender}</span>}
              <div className={styles.MsgText}>
                {msg.message}
                <small>{formatDistanceToNow(new Date(msg.updatedAt), { addSuffix: true })}</small>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.NoMessages}>No messages yet. Say hi!</div>
        )}
      </div>
      <div className={styles.TypingIndicator}>
        {typingDisplay && `${typingDisplay} is typing...`}
      </div>
    </>
  );
};

export default MessageList;
