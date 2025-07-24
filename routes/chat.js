const ChatController = require('../controllers/chat.controller')
const { ROUTE_CREATE_PRIVATE_CHAT, ROUTE_MY_CHATS, ROUTE_GET_CHATS, ROUTE_GET_CHAT_MESSAGES } = require('../util/page-route')

const router = require('express').Router()

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
router.post(ROUTE_CREATE_PRIVATE_CHAT, (req, res)=>{
    const chatController = new ChatController()
    return chatController.createPrivateChat(req, res)
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
router.get(ROUTE_GET_CHATS, (req, res)=>{
    const chatController = new ChatController()
    return chatController.getMyChats(req, res)
})

/**
 * @swagger
 * /chat/get-chat-messages/{roomId}:
 *   get:
 *     summary: Fetch all messages from a specific room
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
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
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
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_CHAT_MESSAGES+"/:id", (req, res)=>{
    const chatController = new ChatController()
    return chatController.getChatMessages(req, res)
})


/**
 * @swagger
 * /chat/rooms/general:
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

module.exports = router