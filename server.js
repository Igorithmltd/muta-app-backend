require("dotenv").config();
require("./lib/cron/updateDietStatus.js");
require("./lib/cron/updateSubscriptionPlan.js");
const express = require("express");
const {Server} = require("socket.io");
const rateLimit = require("express-rate-limit");
const http = require("http");
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToMongoDB = require("./db/connect.js");
const jwt = require('jsonwebtoken');

const errorController = require("./controllers/error.controller.js");
const AppError = require("./util/appError.js");
// const ChatModel = require("./models/chat.model.js");
const MessageModel = require("./models/message.model.js");
const setupSwagger = require("./swagger");
const CallLogModel = require("./models/call-log.model.js");
const webhookFunction = require("./util/webhook.js");
const ChatRoomModel = require("./models/chatModel.js");

const port = process.env.PORT || 5000;
const mongoURL = process.env.MONGODB_URL;

const app = express();
const httpServer = http.createServer(app);

const options = {
  /* ... */
  maxHttpBufferSize: 1e7, // ~10MB
  cors: { origin: "*", methods: ["GET", "POST"] }
};
// const io = socketIO(httpServer, options);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

app.post("/webhook", express.raw({ type: "application/json" }), webhookFunction);


app.use(express.json());
app.use(cookieParser());


app.set('trust proxy', 1);
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

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log({userId},'websocket connection attempt')
  if (!userId) return;

  users[userId] = socket.id;
  console.log(`User ${userId} connected`);

  // 1. Join general forum room
  const generalRoom = await ChatRoomModel.findOne({ type: "group", name: "general" });
  if (generalRoom) {
    socket.join(generalRoom._id.toString());
  }

  // 2. Join all rooms the user is a part of
  const userRooms = await ChatRoomModel.find({ participants: userId });
  userRooms.forEach(room => {
    socket.join(room._id.toString());
  });

  // =================== JOIN ROOM ===================
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    io.to(roomId).emit("userJoined", {
      userId,
      message: `User ${userId} joined the room.`,
    });
  });

  // =================== LISTEN TO CALL ACTIONS ===================
  socket.on("end_call", async (data) => {
    // Update DB and notify other party
    const { sessionId } = data;
    const callLog = await CallLogModel.findOneAndUpdate(
      { sessionId },
      { status: 'ended', endTime: new Date() }
    );

    io.to(callLog.receiverId.toString()).emit("call_ended", callLog);
  });

  // =================== LEAVE ROOM ===================
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${userId} left room ${roomId}`);
    io.to(roomId).emit("userLeft", {
      userId,
      message: `User ${userId} left the room.`,
    });
  });

  // =================== SEND MESSAGE ===================
  socket.on("sendMessage", async ({ roomId, message, type = "text" }) => {
    try {
      const newMessage = await MessageModel.create({
        sender: userId,
        room: roomId,
        message,
        type,
      });

      io.to(roomId).emit("receiveMessage", {
        roomId,
        senderId: userId,
        message: newMessage.message,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // =================== TYPING ===================
  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("isTyping", { senderId: userId, isTyping });
  });

  // =================== NUDGE ===================
  socket.on("nudge", (targetUserId) => {
    const targetSocketId = users[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("nudgeReceived", { from: userId });
    }
  });

  // =================== DISCONNECT ===================
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
    delete users[userId];

    // Notify all rooms (optional)
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        io.to(roomId).emit("userLeft", {
          userId,
          message: `User ${userId} disconnected.`,
        });
      }
    });
  });
});

io.engine.on("upgrade", (req) => {
  console.log("WebSocket upgrade request received");
});
io.engine.on("error", (err) => {
  console.error("Engine error:", err);
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

httpServer.listen(port, async () => {
  console.log(`Server running on ${port}`);
  await connectToMongoDB(mongoURL);
});
