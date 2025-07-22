const router = require("express").Router();
const DietController = require("../controllers/diet.controller");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");
const {
  ROUTE_CREATE_DIET,
  ROUTE_GET_DIET,
  ROUTE_UPDATE_DIET,
  ROUTE_GET_ALL_DIETS,
  ROUTE_DELETE_DIET,
  ROUTE_JOIN_DIET,
  ROUTE_DIET_TASK,
  ROUTE_GET_DIET_ACTION,
  ROUTE_RESET_DIET_ACTION,
  ROUTE_RECOMMENDED_DIETS,
  ROUTE_ACTIVE_DIETS,
  ROUTE_GET_DIET_CATEGORIES,
  ROUTE_SEARCH_DIET_TITLE,
  ROUTE_SEARCH_DIET_BY_CATEGORY,
} = require("../util/page-route");

/**
 * @swagger
 * /diet/create-diet:
 *   post:
 *     summary: Create a new diet
 *     tags:
 *       - Diets
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
 *               - tags
 *               - duration
 *               - dailyMealBreakdown
 *             properties:
 *               image:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: "image_url"
 *                   publicId:
 *                     type: string
 *                     example: "public_id"
 *               title:
 *                 type: string
 *                 example: "third diet"
 *               description:
 *                 type: string
 *                 example: "third diet description"
 *               category:
 *                 type: object
 *                 required:
 *                   - _id
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6863d1d9f94e880960616e38"
 *               calories:
 *                 type: integer
 *                 example: 54
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["here", "there"]
 *               duration:
 *                 type: integer
 *                 example: 5
 *               dailyMealBreakdown:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - breakfastTitle
 *                     - crabs
 *                     - protein
 *                     - fats
 *                     - calories
 *                     - recommendedTime
 *                     - missedBy
 *                   properties:
 *                     breakfastTitle:
 *                       type: string
 *                       example: "breakfastTitle"
 *                     mealType:
 *                       type: string
 *                       example: "breakfast"
 *                     crabs:
 *                       type: integer
 *                       example: 44
 *                     protein:
 *                       type: integer
 *                       example: 55
 *                     fats:
 *                       type: integer
 *                       example: 122
 *                     calories:
 *                       type: integer
 *                       example: 433
 *                     recommendedTime:
 *                       type: string
 *                       example: "01/05/2025"
 *                     missedBy:
 *                       type: string
 *                       example: "01/05/2025"
 *     responses:
 *       201:
 *         description: Diet created successfully
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
 *                   description: Created diet object
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_DIET, [adminAuth], (req, res) => {
  const dietController = new DietController();
  return dietController.createDiet(req, res);
});

/**
 * @swagger
 * /diet/get-all-diets:
 *   get:
 *     summary: Get all diets (paginated)
 *     tags:
 *       - Diets
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: List of diets returned successfully
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
 *                     diets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "Oats and eggs"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 12
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "2025-07-01T07:00:00Z"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "2025-07-01T08:00:00Z"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 24
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ALL_DIETS, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getAllDiets(req, res);
});

/**
 * @swagger
 * /diet/join-diet:
 *   put:
 *     summary: Join a diet
 *     tags:
 *       - Diets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dietId:
 *                 type: string
 *                 example: "64f865b9f8a7ab0012345678"
 *             required:
 *               - dietId
 *     responses:
 *       200:
 *         description: Diet joined successfully
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
 *                   example: Diet joined successfully
 *                 diet:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f865b9f8a7ab0012345678"
 *                     title:
 *                       type: string
 *                       example: "Keto Beginner Diet"
 *                     description:
 *                       type: string
 *                       example: A simple 5-day keto-friendly plan
 *                     category:
 *                       type: string
 *                       example: "64f865b9f8a7ab0012345678"
 *                     calories:
 *                       type: integer
 *                       example: 1500
 *                     duration:
 *                       type: integer
 *                       example: 5
 *                     progress:
 *                       type: integer
 *                       example: 0
 *                     status:
 *                       type: string
 *                       example: pending
 *                     dailyMealBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           breakfastTitle:
 *                             type: string
 *                             example: "Avocado toast"
 *                           mealType:
 *                             type: string
 *                             example: "breakfast"
 *                           crabs:
 *                             type: integer
 *                             example: 30
 *                           protein:
 *                             type: integer
 *                             example: 20
 *                           fats:
 *                             type: integer
 *                             example: 25
 *                           calories:
 *                             type: integer
 *                             example: 400
 *                           recommendedTime:
 *                             type: string
 *                             example: "08:00 AM"
 *                           missedBy:
 *                             type: string
 *                             example: "10:00 AM"
 *                           day:
 *                             type: string
 *                             example: "July 5"
 *                           status:
 *                             type: string
 *                             example: pending
 *       400:
 *         description: Validation error or already joined
 *       404:
 *         description: Diet not found
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_JOIN_DIET, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.joinDiet(req, res);
});

router.put(ROUTE_DIET_TASK, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.markDietTask(req, res);
});

/**
 * @swagger
 * /diet/get-diet:
 *   get:
 *     summary: Get diet
 *     tags:
 *       - Diets
 *     responses:
 *       200:
 *         description: diet returned successfully
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
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "image_url"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "breakfastTitle"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 122
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "01/05/2025"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "01/05/2025"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_DIET + "/:id", [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getDiet(req, res);
});

router.get(ROUTE_GET_DIET_ACTION + "/:id", [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getDietAction(req, res);
});

/**
 * @swagger
 * /diet/update-diet/{id}:
 *   put:
 *     summary: Update a diet by ID
 *     tags:
 *       - Diets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the diet to update
 *         schema:
 *           type: string
 *         example: "6863feb5182f03a90c60ad47"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Diet updated successfully"
 *     responses:
 *       200:
 *         description: Diet updated successfully
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
 *                   example: Diet updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Diet not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_DIET + "/:id", [adminAuth], (req, res) => {
  const dietController = new DietController();
  return dietController.updateDiet(req, res);
});

/**
 * @swagger
 * /diet/delete-diet/{id}:
 *   delete:
 *     summary: Delete a diet by ID
 *     tags:
 *       - Diets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the diet to delete
 *         schema:
 *           type: string
 *         example: "6863feb5182f03a90c60ad47"
 *     responses:
 *       200:
 *         description: Diet deleted successfully
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
 *                   example: Diet deleted successfully
 *       404:
 *         description: Diet not found
 *       500:
 *         description: Server error
 */
router.delete(ROUTE_DELETE_DIET + "/:id", [adminAuth], (req, res) => {
  const dietController = new DietController();
  return dietController.deleteDiet(req, res);
});

/**
 * @swagger
 * /diet/reset-diet-action:
 *   put:
 *     summary: Reset a user's diet progress
 *     tags:
 *       - Diets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dietId:
 *                 type: string
 *                 example: "64f865b9f8a7ab0012345678"
 *             required:
 *               - dietId
 *     responses:
 *       200:
 *         description: Diet progress reset successfully
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
 *                   example: Diet progress reset successfully
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
 *                   example: dietId is required
 *       404:
 *         description: Diet action not found
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
 *                   example: You have not joined this diet
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_RESET_DIET_ACTION, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.resetDietAction(req, res);
});

/**
 * @swagger
 * /diet/recommended-diets:
 *   get:
 *     summary: Get all recommended diets
 *     tags:
 *       - Diets
 *     responses:
 *       200:
 *         description: List of recommended diets returned successfully
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
 *                     diets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "Oats and eggs"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 12
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "2025-07-01T07:00:00Z"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "2025-07-01T08:00:00Z"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       500:
 *         description: Server error
 */
router.get(ROUTE_RECOMMENDED_DIETS, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.recommendedDiets(req, res);
});

/**
 * @swagger
 * /diet/active-diets:
 *   get:
 *     summary: Get all active diets
 *     tags:
 *       - Diets
 *     responses:
 *       200:
 *         description: List of active diets returned successfully
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
 *                     diets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "Oats and eggs"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 12
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "2025-07-01T07:00:00Z"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "2025-07-01T08:00:00Z"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *       500:
 *         description: Server error
 */
router.get(ROUTE_ACTIVE_DIETS, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.activeDiets(req, res);
});

/**
 * @swagger
 * /diet/get-diet-categories:
 *   get:
 *     summary: Get all diet categories
 *     description: Retrieve a list of all available diet categories.
 *     tags:
 *       - Diets
 *     responses:
 *       200:
 *         description: A list of diet categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64d21b5b2a4f8b35c4fabcde
 *                   title:
 *                     type: string
 *                     example: Vegetarian
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-21T12:34:56.789Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-21T12:34:56.789Z
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_DIET_CATEGORIES, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getDietCategories(req, res);
});

/**
 * @swagger
 * /diet/search-diet-title:
 *   get:
 *     summary: Search diets by title
 *     description: Retrieve a list of diets that match the given title (case-insensitive).
 *     tags:
 *       - Diets
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: Title or part of the diet title to search
*     responses:
 *       200:
 *         description: List of diets returned successfully
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
 *                     diets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "Oats and eggs"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 12
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "2025-07-01T07:00:00Z"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "2025-07-01T08:00:00Z"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 24
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *       500:
 *         description: Server error
 */
router.get(ROUTE_SEARCH_DIET_TITLE, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.searchDietByTitle(req, res);
});

/**
 * @swagger
 * /diet/search-diet-by-category:
 *   get:
 *     summary: Search diets by category
 *     description: Retrieve a list of diets that match the given category (case-insensitive).
 *     tags:
 *       - Diets
 *     parameters:
 *       - in: params
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id or part of the diet id to search
*     responses:
 *       200:
 *         description: List of diets returned successfully
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
 *                     diets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6863feb5182f03a90c60ad47"
 *                           title:
 *                             type: string
 *                             example: "third diet"
 *                           description:
 *                             type: string
 *                             example: "third diet description"
 *                           calories:
 *                             type: integer
 *                             example: 54
 *                           duration:
 *                             type: integer
 *                             example: 5
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["here", "there"]
 *                           image:
 *                             type: object
 *                             properties:
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/image.jpg"
 *                               publicId:
 *                                 type: string
 *                                 example: "public_id"
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "6863d1d9f94e880960616e38"
 *                               title:
 *                                 type: string
 *                                 example: "breathing"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-07-01T12:17:29.709Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                           dailyMealBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 breakfastTitle:
 *                                   type: string
 *                                   example: "Oats and eggs"
 *                                 mealType:
 *                                   type: string
 *                                   example: "breakfast"
 *                                 crabs:
 *                                   type: integer
 *                                   example: 44
 *                                 protein:
 *                                   type: integer
 *                                   example: 55
 *                                 fats:
 *                                   type: integer
 *                                   example: 12
 *                                 calories:
 *                                   type: integer
 *                                   example: 433
 *                                 recommendedTime:
 *                                   type: string
 *                                   example: "2025-07-01T07:00:00Z"
 *                                 missedBy:
 *                                   type: string
 *                                   example: "2025-07-01T08:00:00Z"
 *                                 _id:
 *                                   type: string
 *                                   example: "6863feb5182f03a90c60ad48"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-01T15:28:53.228Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 24
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *       500:
 *         description: Server error
 */
router.get(ROUTE_SEARCH_DIET_BY_CATEGORY+"/:id", [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getDietByCategory(req, res);
});

module.exports = router;
