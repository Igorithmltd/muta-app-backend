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
  ROUTE_GET_WEEKLY_CHALLENGE,
  ROUTE_GET_DAILY_CHALLENGE,
  ROUTE_RESET_CHALLENGE_ACTION,
} = require("../util/page-route");

const router = require("express").Router();
/**
 * @swagger
 * /challenge/create-challenge:
 *   post:
 *     summary: Create a new challenge
 *     tags:
 *       - Challenges
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
 *                 example: "New challenge"
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
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Challenge created successfully
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
 * /challenge/get-all-challenges:
 *   get:
 *     summary: Get all challenges (optionally filter by type)
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [weekly, daily]
 *         description: Optional filter by challenge type
 *         required: false
 *         example: daily
 *     responses:
 *       200:
 *         description: List of challenges returned successfully
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
 * /challenge/get-challenge:
 *   get:
 *     summary: Get challenge
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: params
 *         name: id
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Challenge id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: challenge returned successfully
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
 * /challenge/update-challenge:
 *   put:
 *     summary: Update challenge
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Challenge id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: challenge updated successfully
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
 *                         example: "Challenge updated successfully"
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
 * /challenge/delete-challenge:
 *   delete:
 *     summary: Delete challenge
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Challenge id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: challenge deleted successfully
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
 *                         example: "Challenge deleted successfully"
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
 * /challenge/join-challenge:
 *   put:
 *     summary: Join challenge
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: params
 *         name: type
 *         schema:
 *           id: string
 *           exapmle: "6863ece6b0d40e2dd2eabe12"
 *         description: Challenge id
 *         example: 6863ece6b0d40e2dd2eabe12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeId
 *             properties:
 *               challengeId:
 *                 type: string
 *                 example: "6863ece6b0d40e2dd2eabe12"
 *     responses:
 *       200:
 *         description: challenge joined successfully
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
 *                         example: "Challenge joined successfully"
 *                     userId:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                     status:
 *                         type: string
 *                         example: "in-progress"
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
 * /challenge/get-challenge-action:
 *   get:
 *     summary: Get challenge action
 *     tags:
 *       - Challenges
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Challenge id
 *         example: "6863ece6b0d40e2dd2eabe12"
 *     responses:
 *       200:
 *         description: challenge action returned successfully
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
 *                       type: string
 *                       example: "Challenge joined successfully"
 *                     userId:
 *                       type: string
 *                       example: "6863ece6b0d40e2dd2eabe12"
 *                     status:
 *                       type: string
 *                       example: "in-progress"
 *                     challengeId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "6863ece6b0d40e2dd2eabe12"
 *                         title:
 *                           type: string
 *                           example: "fourth challenge"
 *                         goal:
 *                           type: string
 *                           example: "fourth goal"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-02T15:02:03.521+00:00"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-08T15:02:03.521+00:00"
 *                         duration:
 *                           type: integer
 *                           example: 30
 *                         durationUnit:
 *                           type: string
 *                           example: "minute"
 *                         type:
 *                           type: string
 *                           example: "daily"
 *                           enum: [weekly, daily]
 *                         difficulty:
 *                           type: string
 *                           example: "advanced"
 *                         tasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               buttonLabel:
 *                                 type: string
 *                                 example: "close"
 *                               title:
 *                                 type: string
 *                                 example: "Open your phone"
 *                               status:
 *                                 type: string
 *                                 example: "in-progress"
 *                               _id:
 *                                 type: string
 *                                 example: "6863ece6b0d40e2dd2eabe13"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         __v:
 *                           type: integer
 *                           example: 0
 *                     dailyStreak:
 *                       type: integer
 *                       description: User's current daily streak count
 *                       example: 5
 *                     weeklyStreak:
 *                       type: integer
 *                       description: User's current weekly streak count
 *                       example: 2
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
 * /challenge/challenge-task:
 *   put:
 *     summary: Mark a challenge task as completed
 *     tags:
 *       - Challenges
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
 *                 description: The ID of the challenge
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
 *                   example: Challenge task not found
 *       401:
 *         description: Unauthorized - user not part of the challenge
 *       500:
 *         description: Server error
 */
router.put(ROUTE_CHALLENGE_TASK, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.markChallengeTask(req, res);
});

/**
 * @swagger
 * /challenge/get-daily-challenge:
 *   get:
 *     summary: Get daily challenge
 *     tags:
 *       - Challenges
 *     responses:
 *       200:
 *         description: challenge returned successfully
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
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "6863ece6b0d40e2dd2eabe12"
 *                         title:
 *                           type: string
 *                           example: "fourth challenge"
 *                         goal:
 *                           type: string
 *                           example: "fourth goal"
 *                         status:
 *                           type: string
 *                           example: "in-progress"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-02T15:02:03.521+00:00"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-02T15:02:03.521+00:00"
 *                         duration:
 *                           type: integer
 *                           example: 30
 *                         durationUnit:
 *                           type: string
 *                           example: "minute"
 *                         type:
 *                           type: string
 *                           example: "daily"
 *                           enum: [weekly, daily]
 *                         difficulty:
 *                           type: string
 *                           example: "advanced"
 *                         tasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               buttonLabel:
 *                                 type: string
 *                                 example: "close"
 *                               title:
 *                                 type: string
 *                                 example: "Open your phone"
 *                               status:
 *                                 type: string
 *                                 example: "in-progress"
 *                               _id:
 *                                 type: string
 *                                 example: "6863ece6b0d40e2dd2eabe13"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         __v:
 *                           type: integer
 *                           example: 0
 *                     dailyStreak:
 *                       type: integer
 *                       description: User's current daily streak count
 *                       example: 5
 *                     weeklyStreak:
 *                       type: integer
 *                       description: User's current weekly streak count
 *                       example: 2
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_DAILY_CHALLENGE, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.getDailyChallenge(req, res);
});

/**
 * @swagger
 * /challenge/get-weekly-challenge:
 *   get:
 *     summary: Get weekly challenge
 *     tags:
 *       - Challenges
 *     responses:
 *       200:
 *         description: challenge returned successfully
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
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "6863ece6b0d40e2dd2eabe12"
 *                         title:
 *                           type: string
 *                           example: "fourth challenge"
 *                         status:
 *                           type: string
 *                           example: "in-progress"
 *                         goal:
 *                           type: string
 *                           example: "fourth goal"
 *                         weeklyCount:
 *                           type: number
 *                           example: 23
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-02T15:02:03.521+00:00"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-02T15:02:03.521+00:00"
 *                         duration:
 *                           type: integer
 *                           example: 30
 *                         durationUnit:
 *                           type: string
 *                           example: "minute"
 *                         type:
 *                           type: string
 *                           example: "weekly"
 *                           enum: [weekly, daily]
 *                         difficulty:
 *                           type: string
 *                           example: "advanced"
 *                         tasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               buttonLabel:
 *                                 type: string
 *                                 example: "close"
 *                               title:
 *                                 type: string
 *                                 example: "Open your phone"
 *                               status:
 *                                 type: string
 *                                 example: "in-progress"
 *                               _id:
 *                                 type: string
 *                                 example: "6863ece6b0d40e2dd2eabe13"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-01T14:12:55.020Z"
 *                         __v:
 *                           type: integer
 *                           example: 0
 *                     dailyStreak:
 *                       type: integer
 *                       description: User's current daily streak count
 *                       example: 5
 *                     weeklyStreak:
 *                       type: integer
 *                       description: User's current weekly streak count
 *                       example: 2
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_WEEKLY_CHALLENGE, auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.getWeeklyChallenge(req, res);
});

/**
 * @swagger
 * /challenge/reset-challenge-action:
 *   put:
 *     summary: Reset a user's challenge progress
 *     tags:
 *       - Challenges
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: string
 *                 example: "64f865b9f8a7ab0012345678"
 *             required:
 *               - challengeId
 *     responses:
 *       200:
 *         description: Challenge progress reset successfully
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
 *                   example: Challenge progress reset successfully
 *       400:
 *         description: Validation error
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
 *                   example: challengeId is required
 *       404:
 *         description: Challenge action not found
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
 *                   example: You have not joined this challenge
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_RESET_CHALLENGE_ACTION, [auth], (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.resetChallengeAction(req, res);
});

module.exports = router;
