
const router = require("express").Router();

/**
 * @swagger
 * /socket-docs:
 *   get:
 *     summary: Socket.IO Chat Events API Documentation
 *     tags:
 *       - Socket.IO
 *     description: |
 *       ### Socket.IO Real-Time Chat API Overview
 *       
 *       **WebSocket Connection:**
 *       - URL: `https://muta-app-backend.onrender.com`
 *       - Connect with query parameter: `token=<JWT>`
 *       - Authentication is required via JWT token in query string.
 *
 *       ---
 *
 *       **Socket Events:**
 *
 *       - **connection**
 *         - Triggered when a client connects.
 *         - Server authenticates JWT token and sets `userId`.
 *         - User automatically joins the "general" group and all rooms they participate in.
 *         - Emits `userJoined` to general room when user joins.
 *
 *       - **joinRoom(roomId)**
 *         - Client requests to join a specific room.
 *         - Server joins the socket to the room and emits `userJoined` event to that room.
 *         - Payload:
 *           ```json
 *           {
 *             "roomId": "string"
 *           }
 *           ```
 *
 *       - **leaveRoom(roomId)**
 *         - Client requests to leave a room.
 *         - Server removes the socket from the room and emits `userLeft` event.
 *         - Payload:
 *           ```json
 *           {
 *             "roomId": "string"
 *           }
 *           ```
 *
 *       - **sendMessage({ roomId, message, type })**
 *         - Client sends a message to a room.
 *         - Server saves the message and broadcasts `receiveMessage` to the room.
 *         - `type` can be `"text"`, `"image"`, or `"file"`. Defaults to `"text"`.
 *         - Payload:
 *           ```json
 *           {
 *             "roomId": "string",
 *             "message": "string",
 *             "type": "text" | "image" | "file"
 *           }
 *           ```
 *         - Broadcast Event: `receiveMessage`
 *           ```json
 *           {
 *             "roomId": "string",
 *             "senderId": "string",
 *             "message": "string",
 *             "createdAt": "ISODateString"
 *           }
 *           ```
 *
 *       - **markAsRead({ roomId, messageIds })**
 *         - Client marks messages as read.
 *         - Server updates `readBy` array of messages and emits `messagesRead` to room.
 *         - Payload:
 *           ```json
 *           {
 *             "roomId": "string",
 *             "messageIds": ["string"]
 *           }
 *           ```
 *         - Broadcast Event: `messagesRead`
 *           ```json
 *           {
 *             "userId": "string",
 *             "messageIds": ["string"]
 *           }
 *           ```
 *
 *       - **typing({ roomId, isTyping })**
 *         - Client notifies typing status in a room.
 *         - Server broadcasts `isTyping` event to other users in room.
 *         - Payload:
 *           ```json
 *           {
 *             "roomId": "string",
 *             "isTyping": true | false
 *           }
 *           ```
 *         - Broadcast Event: `isTyping`
 *           ```json
 *           {
 *             "senderId": "string",
 *             "isTyping": true | false
 *           }
 *           ```
 *
 *       - **nudge(targetUserId)**
 *         - Client sends a nudge to another user.
 *         - Server forwards `nudgeReceived` event to target user's socket.
 *         - Payload:
 *           ```json
 *           {
 *             "targetUserId": "string"
 *           }
 *           ```
 *         - Event Received by Target:
 *           ```json
 *           {
 *             "from": "string"
 *           }
 *           ```
 *
 *       - **end_call({ sessionId })**
 *         - Client ends a call session.
 *         - Server updates call log and emits `call_ended` to receiver.
 *         - Payload:
 *           ```json
 *           {
 *             "sessionId": "string"
 *           }
 *           ```
 *         - Event Sent to Receiver:
 *           ```json
 *           {
 *             "sessionId": "string",
 *             "status": "ended",
 *             "endTime": "ISODateString"
 *             // ...other call log details
 *           }
 *           ```
 *
 *       - **disconnect**
 *         - When a user disconnects, server cleans up user tracking and emits `userLeft` to rooms.
 *         - Broadcast Event:
 *           ```json
 *           {
 *             "userId": "string",
 *             "message": "User <userId> disconnected."
 *           }
 *           ```
 *
 *       ---
 *
 *       **Client Connection Example:**
 *       ```js
 *       import { io } from "socket.io-client";
 *       
 *       const socket = io("http://localhost:5000", {
 *         query: { token: "<your-jwt-token>" },
 *         auth: { userId: "<your-user-id>" }
 *       });
 *
 *       socket.on("connect", () => {
 *         console.log("Connected");
 *         socket.emit("joinRoom", "<roomId>");
 *         socket.emit("sendMessage", {
 *           roomId: "<roomId>",
 *           message: "Hello!",
 *           type: "text"
 *         });
 *       });
 *       
 *       socket.on("receiveMessage", (data) => {
 *         console.log("New message", data);
 *       });
 *       ```
 *
 *     responses:
 *       200:
 *         description: Socket.IO chat events documentation
 */
router.get("/socket-docs", (req, res) => {
  res.send("View Socket.IO documentation at /api-docs");
});

module.exports = router;
