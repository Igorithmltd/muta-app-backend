const express = require("express");

const router = express.Router();

const CategoryController = require("../controllers/category.controller");

const auth = require("../middlewares/auth");
const { ROUTE_CATEGORY } = require("../util/page-route");
const adminAuth = require("../middlewares/adminAuth");
/**
 * @swagger
 * /categories/category:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the category
 *                 example: weight
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Category created successfully
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CATEGORY, adminAuth, (req, res) => {
  const categoryController = new CategoryController();
  return categoryController.createCategory(req, res);
});

/**
 * @swagger
 * /categories/category:
 *   get:
 *     summary: get all categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "6038488599335iui3u145"
 *                   title:
 *                     type: string
 *                     example: weight
 *       404:
 *         description: Categories not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_CATEGORY, auth, (req, res) => {
  const categoryController = new CategoryController();
  return categoryController.getCategories(req, res);
});

/**
 * @swagger
 * /categories/category/{id}:
 *   get:
 *     summary: Get one category by ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 title:
 *                   type: string
 *                   example: Fitness
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

router.get(`${ROUTE_CATEGORY}/:id`, auth, (req, res) => {
  const categoryController = new CategoryController();
  return categoryController.getCategoryById(req, res);
});
/**
 * @swagger
 * /categories/category/{id}:
 *   put:
 *     summary: Update one category by ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to update
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

router.put(`${ROUTE_CATEGORY}/:id`, adminAuth, (req, res) => {
  const categoryController = new CategoryController();
  return categoryController.updateCategory(req, res);
});

/**
 * @swagger
 * /categories/category/{id}:
 *   delete:
 *     summary: Delete one category by ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to delete
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete(`${ROUTE_CATEGORY}/:id`, adminAuth, (req, res) => {
  const categoryController = new CategoryController();
  return categoryController.deleteCategory(req, res);
});
// Export the router
module.exports = router;