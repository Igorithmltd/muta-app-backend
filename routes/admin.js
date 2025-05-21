// const AdminController = require('../controllers/admin.controller')
// const UserController = require('../controllers/user.controller')
// const { ROUTE_GET_ALL_USERS, ROUTE_GET_SAVINGS, ROUTE_DASHBOARD_STAT } = require('../util/page-route')
// const adminAuth = require('../middlewares/adminAuth')

// const router = require('express').Router()

// /**
//  * @swagger
//  * /admin/get-all-users:
//  *   get:
//  *     summary: Get a list of all users
//  *     tags:
//  *       - Admin
//  *     responses:
//  *       200:
//  *         description: A list of users
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   _id:
//  *                     type: string
//  *                     description: The unique identifier for the user
//  *                     example: 64b1b8c3f3e4c6a913cf5971
//  *                   fullname:
//  *                     type: string
//  *                     description: The full name of the user
//  *                     example: Jane Doe
//  *                   email:
//  *                     type: string
//  *                     format: email
//  *                     description: The user's email address
//  *                     example: jane@example.com
//  *                   phone_number:
//  *                     type: string
//  *                     description: The user's phone number
//  *                     example: 08123456789
//  *                   userType:
//  *                     type: string
//  *                     description: The role of the user
//  *                     example: user
//  *                   createdAt:
//  *                     type: string
//  *                     format: date-time
//  *                     description: When the user account was created
//  *                     example: 2025-05-13T09:34:23.000Z
//  *       500:
//  *         description: Server error
//  */
// router.get(ROUTE_GET_ALL_USERS, [adminAuth], (req, res)=>{
//     const adminController = new AdminController()
//     return adminController.getAllUsers(req, res)
// })
// /**
//  * @swagger
//  * /admin/get-savings:
//  *   get:
//  *     summary: Get all savings categorized by type
//  *     tags:
//  *       - Admin
//  *     responses:
//  *       200:
//  *         description: A list of personal and group savings
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 personalSavings:
//  *                   type: array
//  *                   description: List of personal savings
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       _id:
//  *                         type: string
//  *                         example: "665f8a0e66e8753a16789ef1"
//  *                       title:
//  *                         type: string
//  *                         example: "Emergency Fund"
//  *                       targetAmount:
//  *                         type: number
//  *                         example: 50000
//  *                       frequentAmount:
//  *                         type: number
//  *                         example: 1000
//  *                       savingProgress:
//  *                         type: number
//  *                         example: 60
//  *                 groupSavings:
//  *                   type: array
//  *                   description: List of group savings
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       _id:
//  *                         type: string
//  *                         example: "665f8a0e66e8753a16789ef2"
//  *                       title:
//  *                         type: string
//  *                         example: "Trip to Dubai"
//  *                       targetAmount:
//  *                         type: number
//  *                         example: 200000
//  *                       frequentAmount:
//  *                         type: number
//  *                         example: "5000"
//  *                       groupMembers:
//  *                         type: array
//  *                         items:
//  *                           type: string
//  *                           example: "userId123"
//  *                       memberLimit:
//  *                         type: number
//  *                         example: 5
//  *                       savingProgress:
//  *                         type: number
//  *                         example: 35
//  *       401:
//  *         description: Unauthorized access
//  *       500:
//  *         description: Server error
//  */
// router.get(ROUTE_GET_SAVINGS, [adminAuth], (req, res)=>{
//     const adminController = new AdminController()
//     return adminController.getSavings(req, res)
// })
// /**
//  * @swagger
//  * /admin/dashboard-stat:
//  *   get:
//  *     summary: Get admin dashboard summary statistics
//  *     tags:
//  *       - Admin
//  *     responses:
//  *       200:
//  *         description: Summary of key metrics
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 activeGroup:
//  *                   type: number
//  *                   example: 3
//  *                   description: Number of active group savings
//  *                 totalUsers:
//  *                   type: number
//  *                   example: 5
//  *                   description: Total number of users
//  *       500:
//  *         description: Server error
//  */
// router.get(ROUTE_DASHBOARD_STAT, [adminAuth], (req, res)=>{
//     const adminController = new AdminController()
//     return adminController.dashboardStat(req, res)
// })

// // /**
// //  * @swagger
// //  * /auth/login:
// //  *   post:
// //  *     summary: Login a user
// //  *     tags: [Auth]
// //  *     requestBody:
// //  *       required: true
// //  *       content:
// //  *         application/json:
// //  *           schema:
// //  *             type: object
// //  *             required:
// //  *               - email
// //  *               - password
// //  *             properties:
// //  *               email:
// //  *                 type: string
// //  *               password:
// //  *                 type: string
// //  *     responses:
// //  *       200:
// //  *         description: Login successful
// //  *       401:
// //  *         description: Invalid credentials
// //  */
// // router.post(ROUTE_LOGIN, (req, res)=>{
// //     const userController = new UserController()
// //     return userController.loginUser(req, res)
// // })
// // /**
// //  * @swagger
// //  * /admin/auth/forgot-password:
// //  *   post:
// //  *     summary: Send password reset email
// //  *     tags:
// //  *       - Admin
// //  *     requestBody:
// //  *       required: true
// //  *       content:
// //  *         application/json:
// //  *           schema:
// //  *             type: object
// //  *             required:
// //  *               - email
// //  *             properties:
// //  *               email:
// //  *                 type: string
// //  *                 format: email
// //  *                 example: user@example.com
// //  *     responses:
// //  *       200:
// //  *         description: Reset email sent
// //  *         content:
// //  *           application/json:
// //  *             schema:
// //  *               type: object
// //  *               properties:
// //  *                 message:
// //  *                   type: string
// //  *                   example: Reset email sent
// //  *       400:
// //  *         description: Missing or invalid email
// //  *       500:
// //  *         description: Server error
// //  */
// // router.post(ROUTE_FORGOT_PASSWORD, (req, res)=>{
// //     const userController = new UserController()
// //     return userController.forgotPassword(req, res)
// // })
// // router.post(ROUTE_REFRESH_TOKEN, (req, res)=>{
// //     const userController = new UserController()
// //     return userController.refreshToken(req, res)
// // })

// module.exports = router