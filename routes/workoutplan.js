const WorkoutplanController = require("../controllers/workoutplan.controller");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");
const {
  ROUTE_CREATE_WORKOUTPLAN,
  ROUTE_GET_ALL_WORKOUTPLANS,
  ROUTE_GET_WORKOUTPLAN,
  ROUTE_UPDATE_WORKOUTPLAN,
  ROUTE_DELETE_WORKOUTPLAN,
  ROUTE_JOIN_WORKOUTPLAN,
  ROUTE_GET_WORKOUTPLAN_ACTION,
  ROUTE_WORKOUTPLAN_TASK,
  ROUTE_RESET_WORKOUTPLAN_ACTION,
  ROUTE_RECOMMENDED_WORKOUTPLANS,
  ROUTE_ACTIVE_WORKOUTPLANS,
  ROUTE_RATE_WORKOUTPLAN,
  ROUTE_COMPLETED_WORKOUTPLANS,
  ROUTE_POPULAR_WORKOUTPLANS,
  ROUTE_SEARCH_WORKOUTPLAN_TITLE,
  ROUTE_GET_WORKOUTPLAN_BY_CATEGORY,
  ROUTE_TOTAL_COMPLETED_WORKOUTPLANS,
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
 *               - description
 *               - category
 *               - calories
 *               - roundsCount
 *               - duration
 *               - level
 *               - planRounds
 *             properties:
 *               image:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: "https://res.cloudinary.com/your-cloud/image/upload/v123456789/sample.jpg"
 *                   publicId:
 *                     type: string
 *                     example: "sample_public_id"
 *               title:
 *                 type: string
 *                 example: "Full Body Beginner Workout"
 *               description:
 *                 type: string
 *                 example: "This is a full-body beginner plan."
 *               category:
 *                 type: string
 *                 example: "6863d1d9f94e880960616e38"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *               calories:
 *                 type: integer
 *                 example: 250
 *               roundsCount:
 *                 type: integer
 *                 example: 5
 *               duration:
 *                 type: integer
 *                 example: 30
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "beginner"
 *               recommended:
 *                 type: string
 *                 enum: [YES, NO]
 *                 example: "NO"
 *               planRounds:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rounds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - title
 *                           - restBetweenSet
 *                           - instruction
 *                           - animation
 *                           - workoutExerciseType
 *                           - status
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Push-ups"
 *                           duration:
 *                             type: integer
 *                             example: 30
 *                           set:
 *                             type: integer
 *                             example: 3
 *                           reps:
 *                             type: integer
 *                             example: 15
 *                           restBetweenSet:
 *                             type: integer
 *                             example: 60
 *                           instruction:
 *                             type: string
 *                             example: "Keep your back straight and go down slowly."
 *                           animation:
 *                             type: string
 *                             example: "https://cdn.example.com/pushups.mp4"
 *                           commonMistakesToAvoid:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Do not arch your back", "Do not flare elbows"]
 *                           youtubeLink:
 *                             type: string
 *                             example: "https://youtube.com/example"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/your-cloud/image/upload/v123456789/sample.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "sample_public_id"
 *                           workoutExerciseType:
 *                             type: string
 *                             enum: [time, set-reps]
 *                             example: "set-reps"
 *                           breathingTips:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Inhale while going down", "Exhale while pushing up"]
 *                           focusArea:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                   example: "chest"
 *                                 degree:
 *                                   type: string
 *                                   example: "high"
 *                           status:
 *                             type: string
 *                             enum: [completed, in-progress]
 *                             example: "in-progress"
 *     responses:
 *       201:
 *         description: Workout plan created successfully
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
 *                   description: Created workout plan object
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
 * /workoutplan/get-all-workoutplans:
 *   get:
 *     summary: Get all workout plans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
 * /workoutplan/get-workoutplan/{id}:
 *   get:
 *     summary: Get a single workout plan by ID
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan ID
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: Workout plan returned successfully
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
 *                           example: "Beginner Strength Plan"
 *                         description:
 *                           type: string
 *                           example: "A complete 4-week beginner strength workout."
 *                         status:
 *                           type: string
 *                           enum: [active, inactive]
 *                           example: "active"
 *                         userCount:
 *                           type: number
 *                           example: 20
 *                         image:
 *                           type: object
 *                           properties:
 *                             imageUrl:
 *                               type: string
 *                               example: "https://example.com/image.jpg"
 *                             publicId:
 *                               type: string
 *                               example: "abc123imageId"
 *                         category:
 *                           type: string
 *                           example: "64bfc13b4e7ba2349d3c9999"
 *                         calories:
 *                           type: number
 *                           example: 350
 *                         roundsCount:
 *                           type: number
 *                           example: 5
 *                         duration:
 *                           type: number
 *                           example: 30
 *                         level:
 *                           type: string
 *                           enum: [beginner, intermediate, advanced]
 *                           example: "beginner"
 *                         recommended:
 *                           type: string
 *                           enum: [YES, NO]
 *                           example: "YES"
 *                         planRounds:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rounds:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     title:
 *                                       type: string
 *                                       example: "Push Ups"
 *                                     duration:
 *                                       type: number
 *                                       example: 45
 *                                     set:
 *                                       type: number
 *                                       example: 3
 *                                     animation:
 *                                       type: string
 *                                       example: "https://example.com/pushup.gif"
 *                                     reps:
 *                                       type: number
 *                                       example: 12
 *                                     restBetweenSet:
 *                                       type: number
 *                                       example: 30
 *                                     instruction:
 *                                       type: string
 *                                       example: "Keep your back straight during the movement."
 *                                     workoutExerciseType:
 *                                       type: string
 *                                       enum: [time, set-reps]
 *                                       example: "set-reps"
 *                                     status:
 *                                       type: string
 *                                       enum: [completed, in-progress]
 *                                       example: "in-progress"
 *                                     commonMistakesToAvoid:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                       example: ["Don't flare elbows", "Keep core tight"]
 *                                     youtubeLink:
 *                                       type: string
 *                                       example: "https://youtube.com/watch?v=video123"
 *                                     breathingTips:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                       example: ["Inhale on the way down", "Exhale on the way up"]
 *                                     focusArea:
 *                                       type: array
 *                                       items:
 *                                         type: object
 *                                         properties:
 *                                           value:
 *                                             type: string
 *                                             example: "chest"
 *                                           degree:
 *                                             type: string
 *                                             example: "high"
 *                         averageRating:
 *                           type: number
 *                           example: 4.3
 *                         totalRatings:
 *                           type: number
 *                           example: 18
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
 *       400:
 *         description: Invalid workout plan ID
 *       404:
 *         description: Workout plan not found
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
 * /workoutplan/get-workoutplan-action/{id}:
 *   get:
 *     summary: Get a single workout plan action by ID
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan action ID
 *         example: 6863ece6b0d40e2dd2eabe12
 *     responses:
 *       200:
 *         description: Workout plan action returned successfully
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
 *                           example: "Beginner Strength Plan"
 *                         description:
 *                           type: string
 *                           example: "A complete 4-week beginner strength workout."
 *                         status:
 *                           type: string
 *                           enum: [active, inactive]
 *                           example: "active"
 *                         image:
 *                           type: object
 *                           properties:
 *                             imageUrl:
 *                               type: string
 *                               example: "https://example.com/image.jpg"
 *                             publicId:
 *                               type: string
 *                               example: "abc123imageId"
 *                         category:
 *                           type: string
 *                           example: "64bfc13b4e7ba2349d3c9999"
 *                         calories:
 *                           type: number
 *                           example: 350
 *                         roundsCount:
 *                           type: number
 *                           example: 5
 *                         duration:
 *                           type: number
 *                           example: 30
 *                         level:
 *                           type: string
 *                           enum: [beginner, intermediate, advanced]
 *                           example: "beginner"
 *                         recommended:
 *                           type: string
 *                           enum: [YES, NO]
 *                           example: "YES"
 *                         planRounds:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rounds:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     title:
 *                                       type: string
 *                                       example: "Push Ups"
 *                                     duration:
 *                                       type: number
 *                                       example: 45
 *                                     set:
 *                                       type: number
 *                                       example: 3
 *                                     animation:
 *                                       type: string
 *                                       example: "https://example.com/pushup.gif"
 *                                     reps:
 *                                       type: number
 *                                       example: 12
 *                                     restBetweenSet:
 *                                       type: number
 *                                       example: 30
 *                                     instruction:
 *                                       type: string
 *                                       example: "Keep your back straight during the movement."
 *                                     workoutExerciseType:
 *                                       type: string
 *                                       enum: [time, set-reps]
 *                                       example: "set-reps"
 *                                     status:
 *                                       type: string
 *                                       enum: [completed, in-progress]
 *                                       example: "in-progress"
 *                         averageRating:
 *                           type: number
 *                           example: 4.3
 *                         totalRatings:
 *                           type: number
 *                           example: 18
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
 *       400:
 *         description: Invalid workout plan ID
 *       404:
 *         description: Workout plan not found
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
 *     summary: Mark a workout plan task or an entire day as completed
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *           enum: [all]
 *         required: false
 *         description: Optional flag. If set to `all`, it marks all rounds within the day (identified by `workoutplanRoundId`) as completed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutplanId
 *               - workoutplanRoundId
 *             properties:
 *               workoutplanId:
 *                 type: string
 *                 description: The ID of the workout plan
 *                 example: "64a123456789abcdef123456"
 *               workoutplanRoundId:
 *                 type: string
 *                 description: 
 *                   The ID of the round to mark as completed. 
 *                   If `select=all` is passed in the query, this should be the day ID (planRounds._id). 
 *                   Otherwise, it should be the round ID.
 *                 example: "64a987654321abcdef123456"
 *     responses:
 *       200:
 *         description: Task(s) marked as completed successfully
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
 *                   example: Workout round marked as completed
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
 *                   example: Workout round not found
 *       401:
 *         description: Unauthorized - user not part of the workout plan
 *       500:
 *         description: Server error
 */
router.put(ROUTE_WORKOUTPLAN_TASK, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.markWorkoutPlanTask(req, res);
});

/**
 * @swagger
 * /workoutplan/reset-workoutplan-action:
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
 *               workoutPlanId:
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
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
 * /workoutplan/completed-workoutplans:
 *   get:
 *     summary: Get all completed workoutplans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
router.get(ROUTE_COMPLETED_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getCompletedWorkoutPlans(req, res);
});

/**
 * @swagger
 * /workoutplan/total-completed-workoutplans:
 *   get:
 *     summary: Get all completed workoutplans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
router.get(ROUTE_TOTAL_COMPLETED_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getTotalCompletedWorkoutPlans(req, res);
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
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
/**
 * @swagger
 * /workoutplan/popular-workoutplans:
 *   get:
 *     summary: Get all popular workoutplans
 *     tags:
 *       - Workoutplan
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
router.get(ROUTE_POPULAR_WORKOUTPLANS, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.popularWorkoutPlans(req, res);
});

/**
 * @swagger
 * /rate-workoutplan/{id}:
 *   post:
 *     summary: Rate a workout plan
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the workout plan to rate
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Rating value from 1 to 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 description: Optional review text
 *                 example: "Great workout plan, highly recommend!"
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating submitted successfully"
 *                 averageRating:
 *                   type: string
 *                   example: "4.50"
 *                 totalRatings:
 *                   type: integer
 *                   example: 12
 *       400:
 *         description: Invalid input or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Rating must be an integer between 1 and 5"
 *       404:
 *         description: Workout plan not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Workout plan not found"
 *       500:
 *         description: Server error while rating workout plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while rating workout plan"
 */
router.post(ROUTE_RATE_WORKOUTPLAN, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.rateWorkoutplan(req, res);
});

/**
 * @swagger
 * /workoutplan/search-workoutplan-title:
 *   get:
 *     summary: Search for workout plans by title
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the workout plan to search
 *         example: Beginner Strength Plan
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
 *       404:
 *         description: No workout plan found with the given title
 *       500:
 *         description: Server error
 */
router.get(ROUTE_SEARCH_WORKOUTPLAN_TITLE, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.searchWorkoutplanByTitle(req, res);
});

/**
 * @swagger
 * /workoutplan/get-workoutplan-by-category:
 *   get:
 *     summary: Get workout plans by category ID
 *     tags:
 *       - Workoutplan
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID to filter workout plans by
 *         example: 64bfc13b4e7ba2349d3c9999
 *     responses:
 *       200:
 *         description: List of workout plans returned successfully
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
 *                             example: "Beginner Strength Plan"
 *                           description:
 *                             type: string
 *                             example: "A complete 4-week beginner strength workout."
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: "active"
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "abc123imageId"
 *                           category:
 *                             type: string
 *                             example: "64bfc13b4e7ba2349d3c9999"
 *                           calories:
 *                             type: number
 *                             example: 350
 *                           roundsCount:
 *                             type: number
 *                             example: 5
 *                           duration:
 *                             type: number
 *                             example: 30
 *                           level:
 *                             type: string
 *                             enum: [beginner, intermediate, advanced]
 *                             example: "beginner"
 *                           recommended:
 *                             type: string
 *                             enum: [YES, NO]
 *                             example: "YES"
 *                           planRounds:
 *                             type: array
 *                             description: An array of workout day rounds
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rounds:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         example: "Push Ups"
 *                                       duration:
 *                                         type: number
 *                                         example: 45
 *                                       set:
 *                                         type: number
 *                                         example: 3
 *                                       animation:
 *                                         type: string
 *                                         example: "https://example.com/pushup.gif"
 *                                       reps:
 *                                         type: number
 *                                         example: 12
 *                                       restBetweenSet:
 *                                         type: number
 *                                         example: 30
 *                                       instruction:
 *                                         type: string
 *                                         example: "Keep your back straight during the movement."
 *                                       workoutExerciseType:
 *                                         type: string
 *                                         enum: [time, set-reps]
 *                                         example: "set-reps"
 *                                       commonMistakesToAvoid:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Don't flare your elbows", "Keep core tight"]
 *                                       breathingTips:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                         example: ["Inhale on the way down", "Exhale on push"]
 *                                       youtubeLink:
 *                                         type: string
 *                                         example: "https://youtube.com/watch?v=pushup123"
 *                                       focusArea:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             value:
 *                                               type: string
 *                                               example: "chest"
 *                                             degree:
 *                                               type: string
 *                                               example: "high"
 *                                       status:
 *                                         type: string
 *                                         enum: [completed, in-progress]
 *                                         example: "in-progress"
 *                           averageRating:
 *                             type: number
 *                             example: 4.3
 *                           totalRatings:
 *                             type: number
 *                             example: 18
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
router.get(ROUTE_GET_WORKOUTPLAN_BY_CATEGORY, auth, (req, res) => {
  const workoutplanController = new WorkoutplanController();
  return workoutplanController.getWorkoutplanByCategory(req, res);
});

module.exports = router;
