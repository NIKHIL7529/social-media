const jwt = require("jsonwebtoken");
const { registerChatHandlers } = require("./chatHandler");

const connectedUsers = new Map();

const getOnlineUsers = () =>
  Array.from(connectedUsers.values()).map(({ user }) => ({ user }));

const broadcastOnlineUsers = (io) => {
  io.emit("update-online-users", getOnlineUsers());
};

const socketManager = (io) => {
  io.use((socket, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found"));
    }

    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const user = jwt.verify(token, process.env.SECRET_KEY);
      socket.user = user;
      next();
    } catch {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User Connected via Socket:", socket.id, "User:", socket.user.name);

    const userId = String(socket.user.id);
    const connectedUser = connectedUsers.get(userId) || {
      user: socket.user,
      socketIds: new Set(),
    };

    connectedUser.socketIds.add(socket.id);
    connectedUsers.set(userId, connectedUser);
    socket.join(`user:${socket.user.name}`);

    broadcastOnlineUsers(io);
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
      const currentUser = connectedUsers.get(userId);

      if (currentUser) {
        currentUser.socketIds.delete(socket.id);
        if (currentUser.socketIds.size === 0) {
          connectedUsers.delete(userId);
        }
      }

      broadcastOnlineUsers(io);
    });
  });
};

module.exports = { socketManager };
