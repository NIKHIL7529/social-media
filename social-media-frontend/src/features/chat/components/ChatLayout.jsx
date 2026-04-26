import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import UserContext from '../../../UserContext';
import { useChat } from '../context/ChatContext';
import { useChatSocket } from '../hooks/useChatSocket';
import ChatSidebar from './ChatSidebar';
import MessageWindow from './MessageWindow';
import CreateGroupModal from './CreateGroupModal';
import styles from '../styles/Chat.module.css';
import { backendUrl } from '../../../Utils/backendUrl';
import Swal from 'sweetalert2';

const ChatLayout = () => {
  const user = useContext(UserContext);
  const { 
    setChats, 
    setActiveChatId, 
    activeChatId, 
    activeChat, 
    setMessages, 
    chats 
  } = useChat();
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
  const { sendMessage, emitTyping, emitGroup } = useChatSocket(user);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Load initial chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/message/allChats`, {
          credentials: "include"
        });
        const data = await response.json();
        if (data.status === 200) {
          setChats(data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, [setChats]);

  // Sync activeChatId with URL params
  useEffect(() => {
    if (id && id !== activeChatId) {
      setActiveChatId(id);
    }
  }, [id, activeChatId, setActiveChatId]);

  // Handle redirection from profile (location.state)
  useEffect(() => {
    if (location.state && chats.length > 0) {
      const targetUser = location.state;
      const existingChat = chats.find(c => !c.group && c.users.includes(targetUser));
      if (existingChat) {
        setActiveChatId(existingChat.chatId);
        // Clear state and update URL to the specific chat
        navigate(`/chat/${existingChat.chatId}`, { replace: true, state: null });
      } else {
        // If chat doesn't exist, we could show a "new chat" UI, 
        // but for now, we'll just navigate to the chat page.
        // The user can then start a message which will create the chat on the backend.
      }
    }
  }, [location.state, chats, setActiveChatId, navigate]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/message/messages`, {
            method: "POST",
            body: JSON.stringify({ _id: activeChatId }),
            headers: { "Content-type": "application/json" },
            credentials: "include"
          });
          const data = await response.json();
          if (data.status === 200) {
            // Map messages to include "isMine" for UI rendering
            const mappedMessages = data.messages.messages.map(m => ({
              ...m,
              isMine: m.sender === user.name
            }));
            setMessages(mappedMessages);
          }
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      };
      fetchMessages();
      navigate(`/chat/${activeChatId}`);
    }
  }, [activeChatId, setMessages, user.name, navigate]);

  const handleSendMessage = async (text) => {
    const messageData = {
      message: text,
      sender: user.name,
      receiver: activeChat.users,
      chatId: activeChatId,
      updatedAt: new Date().toISOString()
    };

    // 1. Send to server via REST (to save in DB)
    try {
      const response = await fetch(`${backendUrl}/api/message/sendMessage`, {
        method: "POST",
        body: JSON.stringify({ receiver: activeChat.users, msg: text, _id: activeChatId }),
        headers: { "Content-type": "application/json" },
        credentials: "include"
      });
      const data = await response.json();
      
      if (data.status === 200) {
        // 2. Broadcast via Socket
        const savedMessage = data.message.messages[data.message.messages.length - 1];
        sendMessage({ ...savedMessage, chatId: activeChatId, isMine: true });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await fetch(`${backendUrl}/api/group/createGroup`, {
        method: "POST",
        body: JSON.stringify(groupData),
        headers: { "Content-type": "application/json" },
        credentials: "include"
      });
      const data = await response.json();
      if (data.status === 200) {
        const newGroup = {
          chatId: data.addGroup.chatId,
          name: groupData.name,
          users: groupData.users,
          group: true,
          updatedAt: new Date().toISOString()
        };
        // 1. Update local state
        setChats(prev => [newGroup, ...prev]);
        setActiveChatId(newGroup.chatId);
        // 2. Broadcast via socket
        emitGroup(newGroup);
        setIsGroupModalOpen(false);
        Swal.fire('Success', 'Group created successfully!', 'success');
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      Swal.fire('Error', 'Failed to create group', 'error');
    }
  };

  return (
    <div className={styles.ChatContainer}>
      <ChatSidebar 
        onSearchClick={() => navigate('/search', { state: 'chat' })} 
        onCreateGroupClick={() => setIsGroupModalOpen(true)}
      />
      <MessageWindow 
        onSendMessage={handleSendMessage}
        onTyping={emitTyping}
      />
      <CreateGroupModal 
        open={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default ChatLayout;
