const CallController = require('../controllers/call-log.controller')
const auth = require('../middlewares/auth')
const coachAuth = require('../middlewares/coachAuth')
const { ROUTE_INITIATE_CALL, ROUTE_END_CALL, ROUTE_RECEIVE_CALL, ROUTE_MISS_CALL, ROUTE_REJECT_CALL, ROUTE_GET_USER_CALL_LOGS, ROUTE_GET_AGORA_TOKEN, ROUTE_UPDATE_STATUS, ROUTE_GET_USER_MISSED_CALLS, ROUTE_MARK_CALL_AS_READ, ROUTE_SCHEDULE_CALL, ROUTE_GET_SCHEDULED_CALLS, ROUTE_GET_SCHEDULED_CALL, ROUTE_DELETE_SCHEDULED_CALL, ROUTE_UPDATE_SCHEDULED_CALL, GENERATE_JOIN_TOKEN } = require('../util/page-route')

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
 *         description: Call incoming and logged
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
 * /calls/get-user-missed-calls:
 *   get:
 *     summary: Get all missed calls
 *     description: Retrieve all missed calls for the authenticated user. You can filter by call type (audio or video) using the `callType` query parameter.
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: callType
 *         schema:
 *           type: string
 *           enum: [audio, video]
 *         required: false
 *         description: Filter missed calls by call type
 *     responses:
 *       200:
 *         description: List of missed calls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid call type
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get(ROUTE_GET_USER_MISSED_CALLS, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getUserMissedCalls(req, res)
})

/**
 * @swagger
 * /calls/mark-call-as-read:
 *   put:
 *     summary: Mark a call as read
 *     description: Marks a specific call log as read by its ID.
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the call log to mark as read.
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *           example: all
 *         required: false
 *         description: To select all call logs
 *     responses:
 *       200:
 *         description: Call successfully marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Call marked as read successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Invalid call ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid call ID provided"
 *       404:
 *         description: Call not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Call not found"
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_MARK_CALL_AS_READ, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.markCallAsRead(req, res)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callId
 *               - agoraUid
 *               - channelId
 *             properties:
 *               callId:
 *                 type: string
 *                 description: The call id
 *               agoraUid:
 *                 type: string
 *                 description: The agora uid
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

/**
 * @swagger
 * /calls/schedule-call:
 *   post:
 *     summary: Schedule a new call between a coach and a user
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coachId
 *               - userId
 *               - callDate
 *               - startTime
 *               - endTime
 *               - callType
 *             properties:
 *               coachId:
 *                 type: string
 *                 description: Coach user ID
 *                 example: "68ea489cb3d9204f03bb39b6"
 *               userId:
 *                 type: string
 *                 description: Client user ID
 *                 example: "68ea489cb3d9204f03bb39b6"
 *               callDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-20T10:00:00.000Z"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "09:30am"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "10:00am"
 *               callType:
 *                 type: string
 *                 enum: [audio, video]
 *               description:
 *                 type: string
 *                 example: Weekly fitness progress check-in
 *     responses:
 *       201:
 *         description: Scheduled call created successfully
 *       400:
 *         description: Invalid input or scheduling conflict
 */
router.post(ROUTE_SCHEDULE_CALL, [coachAuth], (req, res)=>{
    const callController = new CallController()
    return callController.scheduleCall(req, res)
})

/**
 * @swagger
 * /calls/get-scheduled-calls:
 *   get:
 *     summary: Get scheduled calls
 *     tags: [Calls]
 *     responses:
 *       200:
 *         description: List of scheduled calls
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 65cfa1a2b3c4d5e6f7g8h9
 *                   coachId:
 *                     type: string
 *                     example: 65bf123abc456def789012
 *                   userId:
 *                     type: string
 *                     example: 65aa123abc456def789012
 *                   callDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-20T10:00:00.000Z"
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "09:30am"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "10:00am"
 *                   callType:
 *                     type: string
 *                     enum: [audio, video]
 *                     example: video
 *                   description:
 *                     type: string
 *                     example: Weekly fitness progress check-in
 *                   status:
 *                     type: string
 *                     enum: [scheduled, completed, cancelled]
 *                     example: scheduled
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-13T08:00:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-13T08:00:00.000Z"
 */
router.get(ROUTE_GET_SCHEDULED_CALLS, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getScheduledCalls(req, res)
})

/**
 * @swagger
 * /calls/get-scheduled-call/{id}:
 *   get:
 *     summary: Get a scheduled call by ID
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled call retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 65cfa1a2b3c4d5e6f7g8h9
 *                 coachId:
 *                   type: string
 *                   example: 65bf123abc456def789012
 *                 userId:
 *                   type: string
 *                   example: 65aa123abc45ydef789016
 *                 callDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-20T10:00:00.000Z"
 *                 startTime:
 *                   type: string
 *                   example: "09:30am"
 *                 endTime:
 *                   type: string
 *                   example: "10:00am"
 *                 callType:
 *                   type: string
 *                   enum: [audio, video]
 *                   example: video
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: scheduled
 *                   enum: [scheduled, completed, cancelled]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Call not found
 */
router.get(ROUTE_GET_SCHEDULED_CALL+"/:id", [auth], (req, res)=>{
    const callController = new CallController()
    return callController.getScheduledCall(req, res)
})

/**
 * @swagger
 * /calls/update-scheduled-call{id}:
 *   put:
 *     summary: Update a scheduled call
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduled call ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *     responses:
 *       200:
 *         description: Scheduled call updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: scheduled call updated successfully
 *       400:
 *         description: Invalid input or scheduling conflict
 *       404:
 *         description: Scheduled call not found
 */
router.put(ROUTE_UPDATE_SCHEDULED_CALL+"/:id", [auth], (req, res)=>{
    const callController = new CallController()
    return callController.modifyScheduleCall(req, res)
})

/**
 * @swagger
 * /calls/delete-scheduled-call/{id}:
 *   delete:
 *     summary: Delete a scheduled call
 *     tags: [Calls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduled call ID
 *     responses:
 *       200:
 *         description: Scheduled call deleted successfully
 *       404:
 *         description: Call not found
 */
router.delete(ROUTE_DELETE_SCHEDULED_CALL+"/:id", [auth], (req, res)=>{
    const callController = new CallController()
    return callController.deleteScheduledCall(req, res)
})

/**
 * @swagger
 * /calls/generate-join-token:
 *   post:
 *     summary: Generate token to join a call
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callId
 *             properties:
 *               callId:
 *                 type: string
 *                 description: ID of the call to join
 *                 example: "65f1a2b3c4d5e6f7890a1234"
 *     responses:
 *       200:
 *         description: Scheduled call joined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     callId:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7890a1234"
 *                     channelId:
 *                       type: string
 *                       example: "session_123456"
 *                     token:
 *                       type: string
 *                       example: "agora_token_string"
 *                     agoraUid:
 *                       type: number
 *                       example: 123456
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "65f1a2b3c4d5e6f7890a5678"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         image:
 *                           type: string
 *                           example: "https://example.com/profile.jpg"
 *                     callType:
 *                       type: string
 *                       example: "video"
 *                     jwtToken:
 *                       type: string
 *                       example: "user_jwt_token_string"
 *       404:
 *         description: Call not found
 */
router.post(GENERATE_JOIN_TOKEN, [auth], (req, res)=>{
    const callController = new CallController()
    return callController.generateAgoraToken(req, res)
})

module.exports = router