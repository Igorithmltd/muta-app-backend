require("dotenv").config();
// require("./lib/cron/updateSavingProgress.js");
const express = require("express");
const socketIO = require("socket.io");
const rateLimit = require("express-rate-limit");
const http = require("http");
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToMongoDB = require("./db/connect.js");

const errorController = require("./controllers/error.controller.js");
const AppError = require("./util/appError.js");
// const ChatModel = require("./models/chat.model.js");
const MessageModel = require("./models/message.model.js");
const setupSwagger = require("./swagger");

const port = process.env.PORT || 5000;
const mongoURL = process.env.MONGODB_URL;

const app = express();
const httpServer = http.createServer(app);

const options = {
  /* ... */
  maxHttpBufferSize: 1e7, // ~10MB
  cors: { origin: "*", methods: ["GET", "POST"] }
};
const io = socketIO(httpServer, options);

const corsOptions = {
  origin: "*",
  // origin: ["https://muta-app-backend.onrender.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ['Authorization', 'refresh_token']
};

// Use CORS with the specified options
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.set("views", "./views");
app.set("view engine", "ejs");

app.options("*", cors(corsOptions));

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  handler: () => new AppError("Too many requests, please try again later", 429),
});

if (process.env.NODE_ENV !== "development") {
  app.use("/api", limiter);
}

// app.use(express.json({
//   verify: (req, res, buf) => {
//     req.rawBody = buf.toString('utf8');
//     return true;
//   }
// }));


const users = {}; // userId -> socketId
const groupId = "general-group-forum"

// Middleware to authenticate users
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;
    next();
  });
});

io.on("connection", (socket) => {
  users[socket.userId] = socket.id;
  console.log(`User ${socket.userId} connected`);

  // ======= JOIN ROOMS (Forum or Private Chat) =======
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);

    io.to(roomId).emit("userJoined", {
      userId: socket.userId,
      message: `${socket.userId} has joined the chat.`,
    });
  });

  // ======= GROUP (Forum) CHAT =======
  socket.on("sendGroupMessage", async ({ groupId, senderId, message }) => {
    try {
      const groupMessage = new MessageModel({
        senderId,
        groupId,
        message,
        type: "group",
      });
      await groupMessage.save();

      io.to(groupId).emit("receiveGroupMessage", {
        senderId,
        groupId,
        message,
      });
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  });

  // ======= PRIVATE (1-on-1) CHAT =======
  socket.on("sendPrivateMessage", async ({ senderId, receiverId, message }) => {
    const privateRoomId = [senderId, receiverId].sort().join("-");

    try {
      const privateMessage = new MessageModel({
        senderId,
        receiverId,
        roomId: privateRoomId,
        message,
        type: "private",
      });
      await privateMessage.save();

      // Emit to both sender and receiver if online
      [senderId, receiverId].forEach((userId) => {
        const socketId = users[userId];
        if (socketId) {
          io.to(socketId).emit("receivePrivateMessage", {
            senderId,
            receiverId,
            message,
          });
        }
      });
    } catch (error) {
      console.error("Error sending private message:", error);
    }
  });

  // ======= TYPING INDICATORS =======
  socket.on("typing", ({ roomId, senderId, isTyping }) => {
    io.to(roomId).emit("isTyping", { senderId, isTyping });
  });

  // ======= LEAVE ROOM =======
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room ${roomId}`);

    io.to(roomId).emit("userLeft", {
      userId: socket.userId,
      message: `${socket.userId} has left the chat.`,
    });
  });

  // ======= DISCONNECT =======
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);

    // Notify rooms user was in (optional)
    for (let roomId of socket.rooms) {
      io.to(roomId).emit("userLeft", {
        userId: socket.userId,
        message: `${socket.userId} has disconnected.`,
      });
    }

    delete users[socket.userId];
  });

  // ======= NUDGE FEATURE =======
  socket.on("nudge", (targetUserId) => {
    const targetSocketId = users[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("nudgeReceived", { from: socket.userId });
    }
  });
});


// app.use("/webhook", express.raw({ type: "application/json" }));

setupSwagger(app);
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("This is the base project");
});

// Non-implemented routes middleware
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can’t find ${req.originalUrl} with ${req.method} method on this server`,
      501
    )
  );
});

app.use(errorController);

app.listen(port, async () => {
  console.log(`Server running on ${port}`);
  await connectToMongoDB(mongoURL);
});
