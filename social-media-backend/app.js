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
const { socketManager } = require("./sockets/socketManager");

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

// Modular Socket Logic
socketManager(io);
