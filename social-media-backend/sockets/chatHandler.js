const mongoose = require("mongoose");
const Message = require("../model/Message");

const userRoom = (userName) => `user:${userName}`;

const registerChatHandlers = (io, socket) => {
  const getConversation = async (chatId) => {
    if (!mongoose.isValidObjectId(chatId)) return null;
    return Message.findOne({ _id: chatId, users: socket.user.name })
      .select("users")
      .lean();
  };

  socket.on("message", async (messageData) => {
    try {
      const conversation = await getConversation(messageData.chatId);
      if (!conversation) return;

      const targets = new Set(conversation.users);
      targets.forEach((targetName) => {
        io.to(userRoom(targetName)).emit("message", messageData);
      });
    } catch (error) {
      console.error("Socket message broadcast failed:", error);
    }
  });

  socket.on("group", async (groupData) => {
    try {
      const conversation = await getConversation(groupData.chatId);
      if (!conversation) return;

      const targets = new Set(conversation.users);
      targets.forEach((userName) => {
        io.to(userRoom(userName)).emit("group", groupData);
      });
    } catch (error) {
      console.error("Socket group broadcast failed:", error);
    }
  });

  socket.on("typing", async (data) => {
    try {
      const { chatId, isTyping } = data;
      const conversation = await getConversation(chatId);
      if (!conversation) return;

      conversation.users
        .filter((userName) => userName !== socket.user.name)
        .forEach((userName) => {
          io.to(userRoom(userName)).emit("user-typing", {
            chatId,
            user: socket.user.name,
            isTyping,
          });
        });
    } catch (error) {
      console.error("Socket typing broadcast failed:", error);
    }
  });
};

module.exports = { registerChatHandlers };
