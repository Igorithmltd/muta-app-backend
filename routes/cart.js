const CartController = require('../controllers/cart.controller');
const auth = require('../middlewares/auth');
const { ROUTE_ADD_TO_CART, ROUTE_UPDATE_CART, ROUTE_REMOVE_FROM_CART, ROUTE_GET_CART } = require('../util/page-route');


const router = require('express').Router();

/**
 * @swagger
 * /cart/add-to-cart:
 *   post:
 *     summary: Add a product variation to the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - variationId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to add
 *                 example: 665fa28b4a1c3f1a32044ea9
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity of the product to add
 *                 example: 2
 *               variationId:
 *                 type: string
 *                 description: ID of the variation to add
 *                 example: 665fa28b4a1c3f1a32044ea9
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to cart successfully
 *       400:
 *         description: Invalid product ID, variation not found, or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product variation not found
 *       401:
 *         description: Unauthorized - user must be logged in
 */
router.post(ROUTE_ADD_TO_CART, auth, async (req, res) => {
    const cartController = new CartController();
    return cartController.addToCart(req, res);
});

/**
 * @swagger
 * /cart/remove-from-cart:
 *   put:
 *     summary: Remove a specific product variation from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - varationId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to remove
 *                 example: 665fa28b4a1c3f1a32044ea9
 *             variationId:
 *                 type: string
 *                 description: ID of the variation to add
 *                 example: 665fa28b4a1c3f1a32044ea9
 *     responses:
 *       200:
 *         description: Product variation removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product variation removed from cart successfully
 *       400:
 *         description: Invalid input or item not found in cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Item not found in cart
 *       401:
 *         description: Unauthorized - user must be logged in
 */
router.put(ROUTE_REMOVE_FROM_CART, auth, async (req, res) => {
    const cartController = new CartController();
    return cartController.removeFromCart(req, res);
});

/**
 * @swagger
 * /cart/update-cart:
 *   put:
 *     summary: Update the quantity of a product variation in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - variationId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to update
 *                 example: 665fa28b4a1c3f1a32044ea9
 *               quantity:
 *                 type: integer
 *                 description: New quantity (minimum 1)
 *                 example: 3
 *               productId:
 *                 type: string
 *                 description: ID of the variation to add
 *                 example: 665fa28b4a1c3f1a32044ea9
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put(ROUTE_UPDATE_CART, auth, async (req, res) => {
    const cartController = new CartController();
    return cartController.updateCart(req, res);
});

/**
 * @swagger
 * /cart/get-cart:
 *   get:
 *     summary: Retrieve the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "665fa28b4a1c3f1a32044ea9"
 *                               title:
 *                                 type: string
 *                                 example: "Hand Bell One"
 *                               price:
 *                                 type: number
 *                                 example: 5500
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     imageUrl:
 *                                       type: string
 *                                       example: "https://example.com/product.jpg"
 *                                     publicId:
 *                                       type: string
 *                                       example: "publicIdOne"
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                           color:
 *                             type: string
 *                             example: "red"
 *                           size:
 *                             type: string
 *                             example: "45"
 *                     totalItems:
 *                       type: number
 *                       example: 3
 *                     totalPrice:
 *                       type: number
 *                       example: 16500
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_CART, auth, async (req, res) => {
    const cartController = new CartController();
    return cartController.getCart(req, res);
});

module.exports = router;