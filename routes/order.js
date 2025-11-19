const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { ROUTE_CREATE_ORDER, ROUTE_GET_ALL_ORDERS, ROUTE_GET_ORDER, ROUTE_GET_USER_ORDER, ROUTE_CANCEL_ORDER, ROUTE_UPDATE_ORDER } = require("../util/page-route");
const auth = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");

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
 *               - paymentMethod
 *               - shippingAddress
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [paystack, on-delivery]
 *                 example: paystack
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - address
 *                   - fullName
 *                   - phoneNumber
 *                   - city
 *                   - region
 *                   - deliveryNote
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   fullName:
 *                     type: string
 *                     example: "John Doe"
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
 *                     example: "Leave package at the door"
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
 *                   example: Order created successfully
 *                 order:
 *                   type: object
 *                   description: The created order details
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

/**
 * @swagger
 * /order/cancel-order/{id}:
 *   put:
 *     summary: Cancel an order by its ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order to cancel
 *         schema:
 *           type: string
 *           example: 652dcb9b4ad2d58b9dfb6e9e
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 order:
 *                   type: object
 *                   description: The cancelled order details
 *       400:
 *         description: Invalid order ID or order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_CANCEL_ORDER+"/:id", auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.cancelOrder(req, res);
});

/**
 * @swagger
 * /order/update-order/{id}:
 *   put:
 *     summary: update an order status by its ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order status to update
 *         schema:
 *           type: string
 *           example: 652dcb9b4ad2d58b9dfb6e9e
 *     responses:
 *       200:
 *         description: Order status successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status successfully
 *                 order:
 *                   type: object
 *                   description: The status order details
 *       400:
 *         description: Invalid order ID or order cannot be set to the status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_ORDER+"/:id", adminAuth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.updateOrderStatus(req, res);
});


module.exports = router;