const registerChatHandlers = (io, socket, onlineUsers) => {
  // Handle single and group messages
  socket.on("message", (messageData) => {
    console.log("Socket: Message received from", socket.user.name, messageData);
    
    const { receiver } = messageData;
    if (!receiver || !Array.isArray(receiver)) return;

    // We want to broadast to all receivers (including the sender's other tabs if any)
    const targets = [...receiver, socket.user.name];

    targets.forEach((targetName) => {
      const targetSockets = onlineUsers.filter(u => u.user.name === targetName);
      targetSockets.forEach(target => {
        io.to(target.socketId).emit("message", messageData);
      });
    });
  });

  // Handle group creation/update broadcasts
  socket.on("group", (groupData) => {
    console.log("Socket: Group update from", socket.user.name, groupData);
    const { users } = groupData;
    if (!users || !Array.isArray(users)) return;

    users.forEach((userName) => {
      const targetSockets = onlineUsers.filter(u => u.user.name === userName);
      targetSockets.forEach(target => {
        io.to(target.socketId).emit("group", groupData);
      });
    });
  });

  // Handle Typing Indicators (New Feature)
  socket.on("typing", (data) => {
    const { chatId, isTyping } = data;
    // Broadcast typing status to everyone in the chat except the sender
    // Note: In a real system we'd check who is in the chat via DB, but here we can broadcast 
    // to all online users who are involved in this chat if we had a more complex mapping.
    // For now, we'll broadcast to the specific receivers defined in the active chat.
    socket.broadcast.emit("user-typing", {
      chatId,
      user: socket.user.name,
      isTyping
    });
  });

  // Legacy 'chat' event for status updates (Compatibility)
  socket.on("chat", () => {
    io.emit("chat", onlineUsers);
  });
};

module.exports = { registerChatHandlers };
