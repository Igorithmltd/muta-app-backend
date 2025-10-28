const CallController = require('../controllers/call-log.controller')
const auth = require('../middlewares/auth')
const { ROUTE_INITIATE_CALL, ROUTE_END_CALL, ROUTE_RECEIVE_CALL, ROUTE_MISS_CALL, ROUTE_REJECT_CALL, ROUTE_GET_USER_CALL_LOGS, ROUTE_GET_AGORA_TOKEN, ROUTE_UPDATE_STATUS } = require('../util/page-route')

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
 *               receiverId:
 *                 type: string
 *                 description: Receiver user ID
 *               callType:
 *                 type: string
 *                 enum: [audio, video]
 *     responses:
 *       201:
 *         description: Call imcoming and logged
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
 * /calls/update-status:
 *   post:
 *     summary: Update the status of a call (e.g. ringing, answered, declined, missed, ended, rejected)
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - status
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Unique call session ID
 *                 example: "session_12345"
 *               status:
 *                 type: string
 *                 enum: [ringing, answered, declined, missed, ended, rejected]
 *                 description: New status to set for the call
 *                 example: "answered"
 *     responses:
 *       200:
 *         description: Call status successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Call status updated to answered"
 *                 data:
 *                   $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Validation error or invalid status transition
 *       404:
 *         description: Call not found
 *       500:
 *         description: Internal server error
 */
router.post(ROUTE_UPDATE_STATUS, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.updateCallStatus(req, res)
})

/**
 * @swagger
 * /calls/get-user-call-logs:
 *   get:
 *     summary: Get call logs for a user
 *     tags: [Calls]
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
router.get(ROUTE_GET_USER_CALL_LOGS, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getUserCallLogs(req, res)
})

/**
 * @swagger
 * /calls/get-agora-token:
 *   get:
 *     summary: Generate Agora RTC token
 *     tags: [Calls]
 *     parameters:
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         required: true
 *         description: Channel name for which the token is generated
 *     responses:
 *       200:
 *         description: Agora token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The generated Agora RTC token
 *                   example: "006xxxaea7a...=="  # example token
 *       400:
 *         description: Missing or invalid channel name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Channel name is required
 *       500:
 *         description: Server error while generating the token
 */
router.get(ROUTE_GET_AGORA_TOKEN, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getAgoraToken(req, res)
})

module.exports = router