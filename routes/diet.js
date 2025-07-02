const router = require("express").Router();
const DietController = require("../controllers/diet.controller");
const auth = require("../middlewares/auth");
const { ROUTE_CREATE_DIET, ROUTE_GET_DIET, ROUTE_UPDATE_DIET, ROUTE_GET_ALL_DIETS, ROUTE_DELETE_DIET } = require("../util/page-route");

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
router.post(ROUTE_CREATE_DIET, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.createDiet(req, res);
});

/**
 * @swagger
 * /diet/get-all-diets:
 *   get:
 *     summary: Get all diets
 *     tags:
 *       - Diets
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
 *                     message:
 *                       type: array
 *                       items:
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
router.get(ROUTE_GET_ALL_DIETS, [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getAllDiets(req, res);
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
router.get(ROUTE_GET_DIET+'/:id', [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.getDiet(req, res);
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
router.put(ROUTE_UPDATE_DIET+'/:id', [auth], (req, res) => {
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
router.delete(ROUTE_DELETE_DIET+'/:id', [auth], (req, res) => {
  const dietController = new DietController();
  return dietController.deleteDiet(req, res);
});

module.exports = router;