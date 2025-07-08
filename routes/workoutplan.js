const WorkoutplanController = require("../controllers/workoutplan.controller");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");
const { ROUTE_CREATE_WORKOUTPLAN, ROUTE_GET_ALL_WORKOUTPLANS, ROUTE_GET_WORKOUTPLAN, ROUTE_UPDATE_WORKOUTPLAN, ROUTE_DELETE_WORKOUTPLAN, ROUTE_JOIN_WORKOUTPLAN, ROUTE_GET_WORKOUTPLAN_ACTION, ROUTE_WORKOUTPLAN_TASK, ROUTE_RESET_WORKOUTPLAN_ACTION, ROUTE_RECOMMENDED_WORKOUTPLANS, ROUTE_ACTIVE_WORKOUTPLANS } = require("../util/page-route");

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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Workoutplan"
 *               description:
 *                 type: string
 *                 example: "Workout plan description"
 *               duration:
 *                 type: integer
 *                 example: 30
 *               category:
 *                 type: string
 *                 example: "6863ece6b0d40e2dd2eabe12"
 *               calories:
 *                 type: number
 *                 example: 54
 *               roundsCount:
 *                 type: number
 *                 example: 12
 *               level:
 *                 type: string
 *                 enum: [intermediate, advanced]
 *                 default: intermediate
 *                 example: "intermediate"
 *               recommended:
 *                 type: string
 *                 enum: [YES, NO]
 *                 default: NO
 *                 example: "NO"
 *               image:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *                   publicId:
 *                     type: string
 *                     example: "public_id_of_image"
 *               rounds:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "close"
 *                     instruction:
 *                       type: string
 *                       example: "Open your phone"
 *                     duration:
 *                       type: number
 *                       example: 55
 *                     set:
 *                       type: number
 *                       example: 12
 *                     animation:
 *                       type: number
 *                       example: 12
 *                     reps:
 *                       type: number
 *                       example: 12
 *                     restBetweenSet:
 *                       type: number
 *                       example: 12
 *                     commonMistakesToAvoid:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Avoid overextending your arms"
 *                     breathingTips:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Avoid overextending your arms"
 *                     focusArea:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Avoid overextending your arms"
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
router.post(ROUTE_CREATE_WORKOUTPLAN, adminAuth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.createWorkoutplan(req, res);
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
router.get(ROUTE_GET_ALL_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getWorkoutPlans(req, res);
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
router.get(ROUTE_GET_WORKOUTPLAN + "/:id", auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getWorkoutPlan(req, res);
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
router.put(ROUTE_UPDATE_WORKOUTPLAN + "/:id", adminAuth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.updateWorkoutPlan(req, res);
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
router.delete(ROUTE_DELETE_WORKOUTPLAN + "/:id", adminAuth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.deleteWorkoutPlan(req, res);
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
router.put(ROUTE_JOIN_WORKOUTPLAN, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.joinWorkoutPlan(req, res);
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
router.get(ROUTE_GET_WORKOUTPLAN_ACTION + "/:id", auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getWorkoutPlanAction(req, res);
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
router.put(ROUTE_WORKOUTPLAN_TASK, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.markWorkoutPlanTask(req, res);
});

/**
 * @swagger
 * /diet/reset-workoutplan-action:
 *   put:
 *     summary: Reset a user's workoutplan progress
 *     tags:
 *       - Workoutplan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutplanId:
 *                 type: string
 *                 example: "64f865b9f8a7ab0012345678"
 *             required:
 *               - workoutplanId
 *     responses:
 *       200:
 *         description: Workoutplan progress reset successfully
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
 *                   example: Workoutplan progress reset successfully
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
 *                   example: workoutplanId is required
 *       404:
 *         description: Workoutplan action not found
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
 *                   example: You have not joined this workoutplan
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_RESET_WORKOUTPLAN_ACTION, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.resetWorkoutplanAction(req, res);
});

/**
 * @swagger
 * /workoutplan/recommended-workoutplans:
 *   get:
 *     summary: Get all recommended workoutplans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of recommended workoutplanss returned successfully
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
router.get(ROUTE_RECOMMENDED_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.recommendedWorkoutplans(req, res);
});

/**
 * @swagger
 * /workoutplan/active-workoutplans:
 *   get:
 *     summary: Get all active workoutplans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of active workoutplans returned successfully
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
router.get(ROUTE_ACTIVE_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.activeWorkoutplans(req, res);
});

module.exports = router;
