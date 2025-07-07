const ChallengeController = require("../controllers/challenge.controller");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");
const {
  ROUTE_GET_ALL_CHALLENGES,
  ROUTE_CREATE_CHALLENGE,
  ROUTE_GET_CHALLENGE,
  ROUTE_UPDATE_CHALLENGE,
  ROUTE_DELETE_CHALLENGE,
  ROUTE_JOIN_CHALLENGE,
  ROUTE_GET_CHALLENGE_ACTION,
  ROUTE_CHALLENGE_TASK,
} = require("../util/page-route");

const router = require("express").Router();
/**
 * @swagger
 * /workoutplan/create-workoutplan:
 *   post:
 *     summary: Create a new workout plan
 *     tags:
 *       - Workoutplan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - goal
 *               - duration
 *               - durationUnit
 *               - type
 *               - difficulty
 *               - tasks
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Workoutplan"
 *               goal:
 *                 type: string
 *                 example: "Achieve something great"
 *               duration:
 *                 type: integer
 *                 example: 30
 *               durationUnit:
 *                 type: string
 *                 example: "minute"
 *               type:
 *                 type: string
 *                 enum: [weekly, daily]
 *                 example: "daily"
 *               difficulty:
 *                 type: string
 *                 example: "intermediate"
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - buttonLabel
 *                     - title
 *                   properties:
 *                     buttonLabel:
 *                       type: string
 *                       example: "close"
 *                     title:
 *                       type: string
 *                       example: "Open your phone"
 *     responses:
 *       201:
 *         description: Workoutplan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workoutplan created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_CHALLENGE, adminAuth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.createChallenge(req, res);
});

/**
 * @swagger
 * /workoutplan/get-all-workoutplan:
 *   get:
 *     summary: Get all workoutplans (optionally filter by type)
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [weekly, daily]
 *         description: Optional filter by workoutplans type
 *         required: false
 *         example: daily
 *     responses:
 *       200:
 *         description: List of workoutplanss returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           title:
 *                             type: string
 *                             example: "fourth challenge"
 *                           goal:
 *                             type: string
 *                             example: "fourth goal"
 *                           startDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           endDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           duration:
 *                             type: integer
 *                             example: 30
 *                           durationUnit:
 *                             type: string
 *                             example: "minute"
 *                           type:
 *                             type: string
 *                             example: "daily"
 *                             enum: [weekly, daily]
 *                           difficulty:
 *                             type: string
 *                             example: "advanced"
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 buttonLabel:
 *                                   type: string
 *                                   example: "close"
 *                                 title:
 *                                   type: string
 *                                   example: "Open your phone"
 *                                 status:
 *                                   type: string
 *                                   example: "in-progress"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863ece6b0d40e2dd2eabe13"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ALL_CHALLENGES, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.getChallenges(req, res);
});

/**
 * @swagger
 * /workoutplan/get-workoutplan:
 *   get:
 *     summary: Get workoutplan
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Workoutplan id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: workoutplan returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           title:
 *                             type: string
 *                             example: "fourth challenge"
 *                           goal:
 *                             type: string
 *                             example: "fourth goal"
 *                           startDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           endDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           duration:
 *                             type: integer
 *                             example: 30
 *                           durationUnit:
 *                             type: string
 *                             example: "minute"
 *                           type:
 *                             type: string
 *                             example: "daily"
 *                             enum: [weekly, daily]
 *                           difficulty:
 *                             type: string
 *                             example: "advanced"
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 buttonLabel:
 *                                   type: string
 *                                   example: "close"
 *                                 title:
 *                                   type: string
 *                                   example: "Open your phone"
 *                                 status:
 *                                   type: string
 *                                   example: "in-progress"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863ece6b0d40e2dd2eabe13"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_CHALLENGE + "/:id", auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.getChallenge(req, res);
});

/**
 * @swagger
 * /workoutplan/update-workoutplan:
 *   put:
 *     summary: Update workoutplan
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Workoutplan id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: Workoutplan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                         type: string
 *                         example: "Workoutplan updated successfully"
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_CHALLENGE + "/:id", adminAuth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.updateChallenge(req, res);
});

/**
 * @swagger
 * /workoutplan/delete-workoutplan:
 *   delete:
 *     summary: Delete workoutplan
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Workoutplan id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: Workoutplan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                         type: string
 *                         example: "Workoutplan deleted successfully"
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.delete(ROUTE_DELETE_CHALLENGE + "/:id", adminAuth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.deleteChallenge(req, res);
});

/**
 * @swagger
 * /workoutplan/join-workoutplan:
 *   put:
 *     summary: Join workoutplan
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Workoutplan id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutplanId
 *             properties:
 *               workoutplanId:
 *                 type: string
 *                 example: "6863ece6b0d40e2dd2eabe12"
 *     responses:
 *       200:
 *         description: workoutplan joined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                         type: string
 *                         example: "Workoutplan joined successfully"
 *                     userId:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                     status:
 *                         type: string
 *                         example: "in-progress"
 *                     streak:
 *                         type: number
 *                         example: 0
 *                     challenge:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           challengeId:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           title:
 *                             type: string
 *                             example: "fourth challenge"
 *                           goal:
 *                             type: string
 *                             example: "fourth goal"
 *                           startDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           endDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           duration:
 *                             type: integer
 *                             example: 30
 *                           durationUnit:
 *                             type: string
 *                             example: "minute"
 *                           type:
 *                             type: string
 *                             example: "daily"
 *                             enum: [weekly, daily]
 *                           difficulty:
 *                             type: string
 *                             example: "advanced"
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 buttonLabel:
 *                                   type: string
 *                                   example: "close"
 *                                 title:
 *                                   type: string
 *                                   example: "Open your phone"
 *                                 status:
 *                                   type: string
 *                                   example: "in-progress"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863ece6b0d40e2dd2eabe13"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.put(ROUTE_JOIN_CHALLENGE, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.joinChallenge(req, res);
});

/**
 * @swagger
 * /workoutplan/get-workoutplan-action:
 *   get:
 *     summary: Get workoutplan action
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Workoutplan action id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: workoutplan action returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                         type: string
 *                         example: "Workoutplan joined successfully"
 *                     userId:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                     status:
 *                         type: string
 *                         example: "in-progress"
 *                     streak:
 *                         type: number
 *                         example: 0
 *                     challengeId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           title:
 *                             type: string
 *                             example: "fourth challenge"
 *                           goal:
 *                             type: string
 *                             example: "fourth goal"
 *                           startDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           endDate:
 *                             type: date
 *                             example: "2025-07-02T15:02:03.521+00:00"
 *                           duration:
 *                             type: integer
 *                             example: 30
 *                           durationUnit:
 *                             type: string
 *                             example: "minute"
 *                           type:
 *                             type: string
 *                             example: "daily"
 *                             enum: [weekly, daily]
 *                           difficulty:
 *                             type: string
 *                             example: "advanced"
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 buttonLabel:
 *                                   type: string
 *                                   example: "close"
 *                                 title:
 *                                   type: string
 *                                   example: "Open your phone"
 *                                 status:
 *                                   type: string
 *                                   example: "in-progress"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863ece6b0d40e2dd2eabe13"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T14:12:55.020Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_CHALLENGE_ACTION + "/:id", auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.getChallengeAction(req, res);
});

/**
 * @swagger
 * /workoutplan/workoutplan-task:
 *   put:
 *     summary: Mark a workoutplan task as completed
 *     tags:
 *       - Workoutplan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeId
 *               - challengeTaskId
 *             properties:
 *               challengeId:
 *                 type: string
 *                 description: The ID of the workoutplan
 *                 example: "64a123456789abcdef123456"
 *               challengeTaskId:
 *                 type: string
 *                 description: The ID of the task to mark as completed
 *                 example: "64a987654321abcdef123456"
 *     responses:
 *       200:
 *         description: Task marked as completed successfully
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
 *                   example: Task marked as completed
 *       400:
 *         description: Invalid request body or missing parameters
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
 *                   example: Workoutplan task not found
 *       401:
 *         description: Unauthorized - user not part of the workoutplan
 *       500:
 *         description: Server error
 */
router.put(ROUTE_CHALLENGE_TASK, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.markChallengeTask(req, res);
});

module.exports = router;
