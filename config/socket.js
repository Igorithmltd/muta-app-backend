const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const ChatRoomModel = require("../models/chatModel");
const CallLogModel = require("../models/call-log.model");
const MessageModel = require("../models/message.model");

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const users = {}; // userId -> socketId
  const groupId = "general-group-forum";

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
    console.log({ userId }, "websocket connection attempt");
    if (!userId) return;

    users[userId] = socket.id;
    console.log(`User ${userId} connected`);

    // 1. Join general forum room
    const generalRoom = await ChatRoomModel.findOne({
      type: "group",
      name: "general",
    });
    if (generalRoom) {
      const isParticipant = generalRoom.participants.some(
        (id) => id.toString() === userId.toString()
      );
      if (!isParticipant) {
        generalRoom.participants.push(userId);
        await generalRoom.save();
      }
      const roomId = generalRoom._id.toString();
      socket.join(roomId);

      io.to(roomId).emit("userJoined", {
        userId,
        message: `User ${userId} joined the general room.`,
      });
    }

    // 2. Join all rooms the user is a part of
    const userRooms = await ChatRoomModel.find({ participants: userId });
    userRooms.forEach((room) => {
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
        { status: "ended", endTime: new Date() }
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

  return io;
}

module.exports = setupSocket;
