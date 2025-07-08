const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { ROUTE_CREATE_ORDER, ROUTE_GET_ALL_ORDERS, ROUTE_GET_ORDER, ROUTE_GET_USER_ORDER } = require("../util/page-route");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * /order/create-order:
 *   post:
 *     summary: Create a new order from the user's cart
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [paystack, on-delivery]
 *                 example: paystack
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   fullName:
 *                     type: string
 *                     example: "John doe"
 *                   phoneNumber:
 *                     type: string
 *                     example: "09183279483"
 *                   city:
 *                     type: string
 *                     example: "Awka"
 *                   region:
 *                     type: string
 *                     example: "Anambra"
 *                   deliveryNote:
 *                     type: string
 *                     example: "And that is the end of the story"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order placed successfully
 *       400:
 *         description: Cart is empty or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_ORDER, auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.createOrder(req, res);
});

/**
 * @swagger
 * /order/get-user-order:
 *   get:
 *     summary: Get all orders of the current user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                       userId:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                       paymentStatus:
 *                         type: string
 *                         example: "pending"
 *                       shippingAddress:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: "John Doe"
 *                           phoneNumber:
 *                             type: string
 *                             example: "09183279483"
 *                           address:
 *                             type: string
 *                             example: "123 Main St"
 *                           region:
 *                             type: string
 *                             example: "Anambra"
 *                           city:
 *                             type: string
 *                             example: "Awka"
 *                           deliveryNote:
 *                             type: string
 *                             example: "And that is the end of the story"
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: string
 *                               example: "6863ece6b0d40e2dd2eabe12"
 *                             quantity:
 *                               type: number
 *                               example: 2
 *                             price:
 *                               type: number
 *                               example: 2500
 *                       paymentMethod:
 *                         type: string
 *                         example: "paystack"
 *                       totalAmount:
 *                         type: number
 *                         example: 5000
 *                       orderStatus:
 *                         type: string
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_USER_ORDER, auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.getUserOrders(req, res);
});

/**
 * @swagger
 * /order/get-order/id:
 *   get:
 *     summary: Get an order of the current user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Single user order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6863ece6b0d40e2dd2eabe12"
 *                     userId:
 *                       type: string
 *                       example: "6863ece6b0d40e2dd2eabe12"
 *                     paymentStatus:
 *                       type: string
 *                       example: "pending"
 *                     shippingAddress:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         phoneNumber:
 *                           type: string
 *                           example: "09183279483"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         region:
 *                           type: string
 *                           example: "Anambra"
 *                         city:
 *                           type: string
 *                           example: "Awka"
 *                         deliveryNote:
 *                           type: string
 *                           example: "And that is the end of the story"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             example: "6863ece6b0d40e2dd2eabe12"
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                           price:
 *                             type: number
 *                             example: 2500
 *                     paymentMethod:
 *                       type: string
 *                       example: "paystack"
 *                     totalAmount:
 *                       type: number
 *                       example: 5000
 *                     orderStatus:
 *                       type: string
 *                       example: "pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ORDER, auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.getOrderById(req, res);
});

/**
 * @swagger
 * /order/get-all-orders:
 *   get:
 *     summary: Get all orders of the current user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                       userId:
 *                         type: string
 *                         example: "6863ece6b0d40e2dd2eabe12"
 *                       paymentStatus:
 *                         type: string
 *                         example: "pending"
 *                       shippingAddress:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: "John Doe"
 *                           phoneNumber:
 *                             type: string
 *                             example: "09183279483"
 *                           address:
 *                             type: string
 *                             example: "123 Main St"
 *                           region:
 *                             type: string
 *                             example: "Anambra"
 *                           city:
 *                             type: string
 *                             example: "Awka"
 *                           deliveryNote:
 *                             type: string
 *                             example: "And that is the end of the story"
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: string
 *                               example: "6863ece6b0d40e2dd2eabe12"
 *                             quantity:
 *                               type: number
 *                               example: 2
 *                             price:
 *                               type: number
 *                               example: 2500
 *                       paymentMethod:
 *                         type: string
 *                         example: "paystack"
 *                       totalAmount:
 *                         type: number
 *                         example: 5000
 *                       orderStatus:
 *                         type: string
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ALL_ORDERS, auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.getAllOrders(req, res);
});

module.exports = router;