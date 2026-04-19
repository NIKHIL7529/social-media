import React, { useState, useEffect, useRef } from 'react';
import { AccountCircle, Groups, Send, EmojiEmotions } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../context/ChatContext';
import styles from '../styles/Chat.module.css';

const MessageWindow = ({ onSendMessage, onTyping }) => {
  const { activeChat, messages, activeChatId, typingUsers } = useChat();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    // Typing indicator logic
    onTyping(activeChatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(activeChatId, false);
    }, 2000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    onTyping(activeChatId, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const chatTyping = typingUsers[activeChatId] || {};
  const typingDisplay = Object.keys(chatTyping).join(', ');

  if (!activeChat) {
    return <div className={styles.PlaceholderWindow}>Select a chat to start messaging</div>;
  }

  return (
    <div className={styles.ChatWindow}>
      <div className={styles.WindowHeader}>
        <div className={styles.AvatarWrapper}>
          {activeChat.group ? <Groups /> : <AccountCircle />}
        </div>
        <div className={styles.ChatTitle}>
          <h3>{activeChat.name || activeChat.users[0]}</h3>
          {activeChat.group && <p>{activeChat.users.length} members</p>}
        </div>
      </div>

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

      <div className={styles.InputArea}>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <EmojiEmotions />
        </button>
        {showEmojiPicker && (
          <div className={styles.EmojiPickerWrapper}>
            <EmojiPicker onEmojiClick={(emoji) => setInputText(prev => prev + emoji.emoji)} />
          </div>
        )}
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!inputText.trim()}>
          <Send />
        </button>
      </div>
    </div>
  );
};

export default MessageWindow;
