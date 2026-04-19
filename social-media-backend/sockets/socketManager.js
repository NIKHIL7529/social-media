const jwt = require("jsonwebtoken");
const { registerChatHandlers } = require("./chatHandler");

let onlineUsers = [];

const socketManager = (io) => {
  // Authentication Middleware
  io.use((socket, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found"));
    }

    // Robust cookie parsing for 'token'
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const user = jwt.verify(token, process.env.SECRET_KEY);
      socket.user = user; // Attach user to socket
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User Connected via Socket:", socket.id, "User:", socket.user.name);

    // Track online users
    const existingIndex = onlineUsers.findIndex(u => u.user.id === socket.user.id);
    if (existingIndex !== -1) {
      onlineUsers[existingIndex].socketId = socket.id;
    } else {
      onlineUsers.push({ user: socket.user, socketId: socket.id });
    }

    // Broadcast updated online users
    io.emit("update-online-users", onlineUsers);

    // Register modular handlers
    registerChatHandlers(io, socket, onlineUsers);

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
      onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
      io.emit("update-online-users", onlineUsers);
    });
  });
};

module.exports = { socketManager };
