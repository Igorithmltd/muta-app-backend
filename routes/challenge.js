const ChallengeController = require("../controllers/challenge.controller");
const auth = require("../middlewares/auth");
const {
  ROUTE_GET_ALL_CHALLENGES,
  ROUTE_CREATE_CHALLENGE,
  ROUTE_GET_CHALLENGE,
  ROUTE_UPDATE_CHALLENGE,
  ROUTE_DELETE_CHALLENGE,
} = require("../util/page-route");

const router = require("express").Router();
/**
 * @swagger
 * /challenges:
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6863ece6b0d40e2dd2eabe12"
 *                     title:
 *                       type: string
 *                       example: "New challenge"
 *                     goal:
 *                       type: string
 *                       example: "Achieve something great"
 *                     duration:
 *                       type: integer
 *                       example: 30
 *                     durationUnit:
 *                       type: string
 *                       example: "minute"
 *                     type:
 *                       type: string
 *                       enum: [weekly, daily]
 *                       example: "daily"
 *                     difficulty:
 *                       type: string
 *                       example: "intermediate"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           buttonLabel:
 *                             type: string
 *                             example: "close"
 *                           title:
 *                             type: string
 *                             example: "Open your phone"
 *                           _id:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe13"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T14:12:55.020Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T14:12:55.020Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_CHALLENGE, auth, (req, res) => {
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
 *         name: type
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
router.put(ROUTE_UPDATE_CHALLENGE + "/:id", auth, (req, res) => {
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
router.delete(ROUTE_DELETE_CHALLENGE + "/:id", auth, (req, res) => {
  const challengeController = new ChallengeController();
  return challengeController.deleteChallenge(req, res);
});

module.exports = router;
