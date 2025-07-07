
const router = require("express").Router();

/**
 * @swagger
 * /socket-docs:
 *   get:
 *     summary: Socket.IO Chat Events
 *     tags:
 *       - Socket.IO
 *     description: |
 *       ### Socket.IO Real-Time Chat API
 *
 *       **Connection**
 *       - URL: `ws://localhost:5000`
 *       - Query: `token=<JWT>`
 *
 *       **Events**
 *       - `joinRoom(roomId)`
 *       - `sendGroupMessage({ groupId, senderId, message })`
 *       - `sendPrivateMessage({ senderId, receiverId, message })`
 *       - `isTyping({ roomId, senderId, isTyping })`
 *       - `nudge(targetUserId)`
 *
 *       **Client Example**
 *       ```js
 *       const socket = io("http://localhost:5000", {
 *         query: { token: "<your-token>" }
 *       });
 *
 *       socket.emit("joinRoom", "general-fitness-forum");
 *       socket.emit("sendGroupMessage", {
 *         groupId: "general-fitness-forum",
 *         senderId: "user123",
 *         message: "Hello world"
 *       });
 *       ```
 *     responses:
 *       200:
 *         description: Socket.IO event reference
 */
router.get("/socket-docs", (req, res) => {
  res.send("View Socket.IO documentation at /api-docs");
});

module.exports = router;
