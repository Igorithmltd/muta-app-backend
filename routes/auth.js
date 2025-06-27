const UserController = require('../controllers/user.controller')
const { ROUTE_REGISTER, ROUTE_LOGIN, ROUTE_FORGOT_PASSWORD, ROUTE_RESET_PASSWORD, ROUTE_SEND_OTP, ROUTE_VERIFY_OTP, ROUTE_VERIFY_EMAIL, ROUTE_VERIFY_PASSWORD_OTP, ROUTE_REFRESH_TOKEN, ROUTE_GOOGLE_SIGNUP } = require('../util/page-route')

const router = require('express').Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: gRDERIdiidfjii@
 *               userType:
 *                 type: string
 *                 format: password
 *                 example: (user | coach)
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *       400:
 *         description: Missing or invalid email
 *       500:
 *         description: Server error
 */

router.post(ROUTE_REGISTER, (req, res)=>{
    const userController = new UserController()
    return userController.createUser(req, res)
})

/**
 * @swagger
 * /auth/google-signup:
 *   post:
 *     summary: Register new user through google
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               idToken:
 *                 type: string
 *                 format: text
 *                 example: <your_id_token>
 *               userType:
 *                 type: string
 *                 format: text
 *                 example: (user | coach)
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: <access_token>
 *       400:
 *         description: Missing or invalid email
 *       500:
 *         description: Server error
 */
router.post(ROUTE_GOOGLE_SIGNUP, (req, res)=>{
    const userController = new UserController()
    return userController.googleSignup(req, res)
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(ROUTE_LOGIN, (req, res)=>{
    const userController = new UserController()
    return userController.loginUser(req, res)
})
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset email sent
 *       400:
 *         description: Missing or invalid email
 *       500:
 *         description: Server error
 */
router.post(ROUTE_FORGOT_PASSWORD, (req, res)=>{
    const userController = new UserController()
    return userController.forgotPassword(req, res)
})
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Change your password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: string
 *                 example: Word1234.
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Missing or invalid email or OTP
 *       500:
 *         description: Server error
 */
router.post(ROUTE_RESET_PASSWORD, (req, res)=>{
    const userController = new UserController()
    return userController.resetPassword(req, res)
})
/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send your otp
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Missing or invalid email
 *       500:
 *         description: Server error
 */
router.post(ROUTE_SEND_OTP, (req, res)=>{
    const userController = new UserController()
    return userController.sendOTP(req, res)
})
/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify your otp
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 format: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Missing or invalid email or OTP
 *       500:
 *         description: Server error
 */
router.post(ROUTE_VERIFY_OTP, (req, res)=>{
    const userController = new UserController()
    return userController.verifyOTP(req, res)
})
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify your email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Missing or invalid email
 *       500:
 *         description: Server error
 */
router.post(ROUTE_VERIFY_EMAIL, (req, res)=>{
    const userController = new UserController()
    return userController.verifyEmail(req, res)
})
/**
 * @swagger
 * /auth/verify-password-otp:
 *   post:
 *     summary: Verify your reset password OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 format: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Missing or invalid email or OTP
 *       500:
 *         description: Server error
 */
router.post(ROUTE_VERIFY_PASSWORD_OTP, (req, res)=>{
    const userController = new UserController()
    return userController.verifyPasswordOTP(req, res)
})
/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     summary: Refresh Access Token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Access token successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Refresh token is missing or invalid
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
 *                   example: No refresh token
 *       401:
 *         description: Invalid or expired refresh token
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
 *                   example: Invalid refresh token
 */

router.post(ROUTE_REFRESH_TOKEN, (req, res)=>{
    const userController = new UserController()
    return userController.refreshToken(req, res)
})

module.exports = router