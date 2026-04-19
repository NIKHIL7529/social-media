const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { token_User_Verify } = require("./utils/tokenVerification.js");
const Message = require("./model/Message.js");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

dotenv.config({ path: "./config.env" });
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://main--majestic-choux-1d8140.netlify.app",
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const DB = process.env.DATABASE;
// const DB = "mongodb://127.0.0.1:27017/SocialMediaDB";
const PORT = process.env.PORT;

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/user", require("./routes/user.js"));
app.use("/api/post", require("./routes/post.js"));
app.use("/api/group", require("./routes/group.js"));
app.use("/api/message", require("./routes/message.js"));

app.get("/testing", async (req, res) => {
  const temp = await Message.find({});
  res.json(temp);
});

mongoose
  .connect(DB)
  .then(() => httpServer.listen(PORT))
  .then(() =>
    console.log(
      "Connected to Database and Listening to LocalHost on Port: " + PORT
    )
  )
  .catch((err) => {
    console.error("Database connection error:");
    if (err.code === "ENOTFOUND") {
      console.error(
        "DIAGNOSIS: DNS Resolution Failure. Your computer cannot find the MongoDB host."
      );
      console.error(
        "FIX 1: Verify the connection string in config.env. (Is cluster0.rvopthm.mongodb.net correct?)"
      );
      console.error(
        "FIX 2: Try using the 'Standard Connection String' (mongodb:// instead of mongodb+srv://) from the Atlas Connect modal."
      );
    } else {
      console.error(err);
    }
  });

const onlineUsers = [];

io.on("connection", (socket) => {
  console.log(
    "Socket Id:---------------------------------------------------------------------------------------------------------------------- ",
    socket.id
  );
  const cookies = socket.request.headers.cookie;
  let token = "";
  if (cookies) {
    token = cookies.split("=")[1];
  }
  const socketId = socket.id;

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    
    let result = -1;

    onlineUsers.map((o_user, index) => {
      console.log("o user ", o_user.user.name, "Main user", user.name);
      if (o_user.user.name === user.name) {
        result = index;
      }
    });

    console.log("Result is ********************", result);

    if (result !== -1) {
      onlineUsers[result].socketId = socketId;
    } else {
      onlineUsers.push({ user, socketId });
      onlineUsers.map((o_user, index) =>
        io.to(o_user.socketId).emit("chat", onlineUsers)
      );
    }

    console.log(onlineUsers);

    socket.on("chat", () => {
      console.log(
        "Chat-----------------------------------------////////////////////"
      );
      onlineUsers.map((onlineUser) =>
        io.to(onlineUser.socketId).emit("chat", onlineUsers)
      );
    });

    socket.on("message", (message) => {
      console.log("Message from Client: ", message);
      if (message.receiver.length === 1) {
        message.receiver = [message.sender, ...message.receiver];
      }

      message.receiver.map((receiver) => {
        let socketId = null;
        onlineUsers.map((o_user, index) => {
          console.log("online users", o_user.user.name, "Main user", receiver);
          if (o_user.user.name === receiver) {
            socketId = o_user.socketId;
            io.to(socketId).emit("message", message);
            console.log(socketId);
          }
        });
      });
    });

    socket.on("group", (group) => {
      console.log("Group created: ", group);
      group.users.map((user) => {
        let socketId = null;
        onlineUsers.map((o_user, index) => {
          console.log("online users", o_user.user.name, "Main user", user);
          if (o_user.user.name === user) {
            socketId = o_user.socketId;
            io.to(socketId).emit("group", group);
            console.log(socketId);
          }
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
      console.log(socket.id);
      onlineUsers.map((o_user, index) => {
        if (o_user.socketId === socket.id) {
          onlineUsers.splice(index, 1);
        }
      });
      console.log(onlineUsers);
      onlineUsers.map((o_user, index) =>
        io.to(o_user.socketId).emit("chat", onlineUsers)
      );
    });
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
  }
});
