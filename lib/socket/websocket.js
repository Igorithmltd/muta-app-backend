

const users = {}; // userId -> socketId
const groupId = "general-group-forum"

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