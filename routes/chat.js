const ChatController = require('../controllers/chat.controller')
const { ROUTE_CREATE_PRIVATE_CHAT, ROUTE_GET_CHATS, ROUTE_GET_CHAT_MESSAGES, ROUTE_GENERAL_CHAT, ROUTE_SEARCH_MESSAGE, ROUTE_SEND_MESSAGE, ROUTE_LIKE_UNLIKE_MESSAGE, ROUTE_GET_UNREAD_MESSAGES, ROUTE_FLAG_MESSAGE } = require('../util/page-route')

const router = require('express').Router()
const auth = require('../middlewares/auth')
const adminAuth = require('../middlewares/adminAuth')

/**
 * @swagger
 * /chat/create-private-chat:
 *   post:
 *     summary: Create a new chat room (private or group)
 *     tags: 
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the room (for group only)
 *               type:
 *                 type: string
 *                 enum: [private, group]
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Invalid request or duplicate room
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_PRIVATE_CHAT, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.createPrivateChat(req, res)
})

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: Send a new message to a chat room (group or private)
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - message
 *             properties:
 *               roomId:
 *                 type: string
 *                 description: ID of the chat room
 *               receiverId:
 *                 type: string
 *                 description: ID of the recipient (for private chats only)
 *               message:
 *                 type: string
 *                 description: The message content
 *               type:
 *                 type: string
 *                 enum: [text, image, file, audio, video]
 *                 default: text
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 651d0a8e9d4c1c001f8d4e8a
 *                     receiverId:
 *                       type: string
 *                       example: 651d0a8e9d4c1c001f8d4e90
 *                     roomId:
 *                       type: string
 *                       example: 651d0a8e9d4c1c001f8d4e91
 *                     message:
 *                       type: string
 *                       example: "Hello, how are you?"
 *                     type:
 *                       type: string
 *                       example: "text"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-03T18:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-03T18:00:00.000Z"
 *                     readBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(ROUTE_SEND_MESSAGE, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.createMessage(req, res)
})

/**
 * @swagger
 * /chat/get-chats:
 *   get:
 *     summary: Get all rooms the logged-in user belongs to
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [private, group]
 *                       name:
 *                         type: string
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get(ROUTE_GET_CHATS, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.getMyChats(req, res)
})

/**
 * @swagger
 * /chat/get-chat-messages/{roomId}:
 *   get:
 *     summary: Fetch all messages from a specific room with optional time filters and pagination
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - name: afterTime
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return messages created *after* this time (exclusive)
 *       - name: beforeTime
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return messages created *before* this time (exclusive)
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1)
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages per page (default is 50)
 *     responses:
 *       200:
 *         description: List of messages with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sender:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [text, image, file]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_CHAT_MESSAGES+"/:id", auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.getChatMessages(req, res)
})


/**
 * @swagger
 * /chat/general-chat:
 *   get:
 *     summary: Get information about the general (forum) room
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: General forum room info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 room:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Server error
 */

router.get(ROUTE_GENERAL_CHAT, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.generalChat(req, res)
})

/**
 * @swagger
 * /chat/search-message:
 *   get:
 *     summary: Search messages in a chat room by keyword
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat room
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword to search within the messages
 *     responses:
 *       200:
 *         description: List of matching messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       room:
 *                         type: string
 *                       senderId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       receiverId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [text, image, file]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: roomId and keyword are required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get(ROUTE_SEARCH_MESSAGE, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.searchMessage(req, res)
})

/**
 * @swagger
 * /chat/like-unlike-message/{messageId}:
 *   put:
 *     summary: Like or unlike a message
 *     description: Toggles the like status of a message for the currently authenticated user.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to like or unlike
 *     responses:
 *       200:
 *         description: Like status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message like status updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       example: 651dfaaab12a24c87b99b101
 *                     likeCount:
 *                       type: integer
 *                       example: 3
 *                     likedByMe:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.put(ROUTE_LIKE_UNLIKE_MESSAGE+"/:id", auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.likeMessage(req, res)
})

/**
 * @swagger
 * /chat/flag-message/{messageId}:
 *   put:
 *     summary: Flag or unflag a message
 *     description: Toggles the flag status of a message for the currently authenticated user.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to flag or unflag
 *     responses:
 *       200:
 *         description: Flag status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message flagged status updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       example: 651dfaaab12a24c87b99b101
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.put(ROUTE_FLAG_MESSAGE+"/:id", adminAuth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.flagMessage(req, res)
})

/**
 * @swagger
 * /chat/get-unread-messages:
 *   get:
 *     summary: Get all unread messages for the authenticated user
 *     description: Retrieves all messages in a specific chat room that have not yet been read by the currently authenticated user.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat room to fetch unread messages from
 *     responses:
 *       200:
 *         description: Unread messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   description: Array of unread message documents
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *             examples:
 *               success:
 *                 summary: Example response
 *                 value:
 *                   message:
 *                     - _id: "6532a4dfb28b7a9c1ef00123"
 *                       senderId: "64fe9a1dfb23a5b2a9d00123"
 *                       receiverId: "650f5b2db41a6ca09ad00123"
 *                       roomId: "652f1c9aa4b1c7e8b9f0e456"
 *                       message: "Hey, are you joining the meeting?"
 *                       type: "text"
 *                       readBy: []
 *                       seenBy: []
 *                       likes: []
 *                       createdAt: "2025-10-23T10:20:00.000Z"
 *                       updatedAt: "2025-10-23T10:25:00.000Z"
 *                     - _id: "6532a4dfb28b7a9c1ef00124"
 *                       senderId: "64fe9a1dfb23a5b2a9d00124"
 *                       receiverId: "650f5b2db41a6ca09ad00124"
 *                       roomId: "652f1c9aa4b1c7e8b9f0e456"
 *                       message: "Don't forget the project update!"
 *                       type: "text"
 *                       readBy: []
 *                       seenBy: []
 *                       likes: []
 *                       createdAt: "2025-10-23T11:00:00.000Z"
 *                       updatedAt: "2025-10-23T11:00:00.000Z"
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: roomId is required
 *       404:
 *         description: Room or messages not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No unread messages found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get(ROUTE_GET_UNREAD_MESSAGES, auth, (req, res)=>{
    const chatController = new ChatController()
    return chatController.unreadUserMessages(req, res)
})

module.exports = router