import React, { useState, useRef } from 'react';
import { Send, EmojiEmotions } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import styles from '../styles/Chat.module.css';

const MessageInput = ({ onSendMessage, onTyping, activeChatId }) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);

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

  const onEmojiClick = (emojiData) => {
    setInputText(prev => prev + emojiData.emoji);
    // Optional: close picker after selection
    // setShowEmojiPicker(false);
  };

  return (
    <div className={styles.InputArea}>
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add emoji">
        <EmojiEmotions />
      </button>
      
      {showEmojiPicker && (
        <div className={styles.EmojiPickerWrapper}>
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <input 
        type="text" 
        placeholder="Type a message..." 
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      
      <button onClick={handleSend} disabled={!inputText.trim()} title="Send message">
        <Send />
      </button>
    </div>
  );
};

export default MessageInput;
