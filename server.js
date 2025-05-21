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
// const MessageModel = require("./models/message.model.js");
const setupSwagger = require("./swagger");

const port = process.env.PORT || 5000;
const mongoURL = process.env.MONGODB_URL;

const app = express();
const httpServer = http.createServer(app);

const options = {
  /* ... */
};
const io = socketIO(httpServer, options);

const corsOptions = {
  origin: ["https://growe-app.onrender.com", "http://localhost:3000"],
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
// Socket.IO events for real-time messaging
// const users = {}; // Store online users (userId -> socketId)

// io.use((socket, next) => {
//   const token = socket.handshake.query.token;
//   if (!token) return next(new Error("Authentication error"));

//   jwt.verify(token, "aaaaaaaaa", (err, decoded) => {
//     if (err) return next(new Error("Authentication error"));
//     socket.userId = decoded.id; // Attach userId to the socket object
//     next();
//   });
// });

// io.on("connection", (socket) => {
//   // Add user to the users object when they connect
//   users[socket.userId] = socket.id;

//   // Join room based on groupId
//   socket.on("joinRoom", (groupId) => {
//     socket.join(groupId); // Join the group (room)
//     console.log(`User ${socket.userId} joined room ${groupId}`);

//     // Optional: Notify the group that a new user has joined
//     io.to(groupId).emit("userJoined", {
//       userId: socket.userId,
//       message: `${socket.userId} has joined the group.`,
//     });
//   });

//   // Handle sending messages to a group
//   socket.on("sendMessageToGroup", async (messageData) => {
//     const { senderId, groupId, message } = JSON.parse(messageData);

//     // Create and save the message to the database (example)
//     const chat = await ChatModel.findById(groupId);

//     try {
//       if (chat) {

//         // Emit the message to all members of the chat
//         chat.members.forEach((memberId) => {
//           const socketId = users[memberId]; // assuming you have a map of user ids to socket ids
//           if (socketId) {
//             io.to(socketId).emit("receiveMessage", messageData);
//           }
//         });
//         const groupMessage = new MessageModel({
//           senderId,
//           groupId,
//           message,
//         });
  
//         await groupMessage.save();
//       }
//     } catch (error) {
//       AppLogger.error(error);
//     }

//     // Send the message to all users in the group (room)
//     io.to(groupId).emit("receiveGroupMessage", messageData);
//   });

//   // Handle typing event in the group
//   socket.on("isTyping", (typingData) => {
//     const { senderId, groupId, isTyping } = typingData;
//     io.to(groupId).emit("isTyping", { senderId, isTyping });
//   });

//   // Handle explicit user leaving a room
//   socket.on("leaveRoom", (groupId) => {
//     socket.leave(groupId); // Remove user from the group (room)
//     console.log(`User ${socket.userId} left room ${groupId}`);

//     // Notify other users that this user left the group
//     io.to(groupId).emit("userLeft", {
//       userId: socket.userId,
//       message: `${socket.userId} has left the group.`,
//     });
//   });

//   // Handle user disconnection (going offline)
//   socket.on("disconnect", () => {
//     // Notify other users in the same group (room) that this user has disconnected
//     for (let groupId of Object.keys(socket.rooms)) {
//       io.to(groupId).emit("userLeft", {
//         userId: socket.userId,
//         message: `${socket.userId} has disconnected.`,
//       });
//     }

//     // Clean up: remove the user from the users object
//     delete users[socket.userId];
//   });

//   // Nudge user (send a "nudge-received" event to a user)
//   socket.on("nudge", (id) => {
//     socket.emit("nudge-received").to(id); // Send nudge to the specified user
//   });
// });

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
