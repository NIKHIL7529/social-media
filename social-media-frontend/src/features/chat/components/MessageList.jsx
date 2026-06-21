import React, { useLayoutEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import styles from '../styles/Chat.module.css';

const MessageList = ({
  messages,
  activeChat,
  typingDisplay,
  onLoadOlder,
  hasOlderMessages,
}) => {
  const scrollRef = useRef(null);
  const previousFirstMessageRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const list = scrollRef.current;
    if (!list) return;

    const firstMessageId = messages[0]?._id || null;
    const historyWasPrepended =
      previousFirstMessageRef.current &&
      firstMessageId !== previousFirstMessageRef.current;

    if (historyWasPrepended) {
      list.scrollTop = list.scrollHeight - previousScrollHeightRef.current;
    } else {
      list.scrollTop = list.scrollHeight;
    }

    previousFirstMessageRef.current = firstMessageId;
    previousScrollHeightRef.current = list.scrollHeight;
  }, [messages, typingDisplay]);

  return (
    <>
      <div className={styles.MessageList} ref={scrollRef}>
        {hasOlderMessages && (
          <button className={styles.LoadOlderButton} onClick={onLoadOlder}>
            Load older messages
          </button>
        )}
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
