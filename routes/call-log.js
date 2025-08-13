const CallController = require('../controllers/call-log.controller')
const auth = require('../middlewares/auth')
const { ROUTE_INITIATE_CALL, ROUTE_END_CALL, ROUTE_RECEIVE_CALL, ROUTE_MISS_CALL, ROUTE_REJECT_CALL, ROUTE_GET_USER_CALL_LOGS } = require('../util/page-route')

const router = require('express').Router()

/**
 * @swagger
 * /calls/initiate-call:
 *   post:
 *     summary: Initiate a new call
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callerId
 *               - receiverId
 *               - callType
 *               - sessionId
 *             properties:
 *               callerId:
 *                 type: string
 *                 description: Caller user ID
 *               receiverId:
 *                 type: string
 *                 description: Receiver user ID
 *               callType:
 *                 type: string
 *                 enum: [audio, video]
 *               sessionId:
 *                 type: string
 *                 description: Unique call session ID from Agora/Twilio
 *     responses:
 *       201:
 *         description: Call initiated and logged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Bad request
 */
router.post(ROUTE_INITIATE_CALL, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.initiateCall(req, res)
})

/**
 * @swagger
 * /calls/receive-call:
 *   post:
 *     summary: Mark a call as received (answered)
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Call session ID
 *     responses:
 *       200:
 *         description: Call marked as received
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallLog'
 *       404:
 *         description: Call not found
 */
router.post(ROUTE_RECEIVE_CALL, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.recievedCall(req, res)
})

/**
 * @swagger
 * /calls/end-call:
 *   post:
 *     summary: End a call and update its log
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Call session ID
 *     responses:
 *       200:
 *         description: Call ended and updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallLog'
 *       404:
 *         description: Call not found
 */
router.post(ROUTE_END_CALL, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.endCall(req, res)
})

/**
 * @swagger
 * /calls/miss-call:
 *   post:
 *     summary: Mark a call as missed
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callerId
 *               - receiverId
 *               - sessionId
 *             properties:
 *               callerId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *                 description: Call session ID
 *     responses:
 *       201:
 *         description: Missed call logged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Bad request
 */
router.post(ROUTE_MISS_CALL, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.missCall(req, res)
})

/**
 * @swagger
 * /calls/reject-call:
 *   post:
 *     summary: Mark a call as rejected
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Call session ID
 *     responses:
 *       200:
 *         description: Call marked as rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CallLog'
 *       404:
 *         description: Call not found
 */
router.post(ROUTE_REJECT_CALL, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.rejectCall(req, res)
})

/**
 * @swagger
 * /calls/get-user-call-logs/{userId}:
 *   get:
 *     summary: Get call logs for a user
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to fetch call logs for
 *     responses:
 *       200:
 *         description: List of call logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CallLog'
 *       404:
 *         description: No call logs found for user
 */
router.post(ROUTE_GET_USER_CALL_LOGS+"/:id", [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getUserCallLogs(req, res)
})

module.exports = router