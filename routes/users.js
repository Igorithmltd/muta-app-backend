const UserController = require('../controllers/user.controller')
const auth = require('../middlewares/auth')
const { ROUTE_GET_ACCOUNT, ROUTE_SEED, ROUTE_PROFILE_IMAGE_UPLOAD, ROUTE_UPDATE_ACCOUNT_DETAILS } = require('../util/page-route')

const router = require('express').Router()

/**
 * @swagger
 * /users/get-account:
 *   get:
 *     summary: Get user details
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: The user details object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier for the user
 *                   example: 609e129e8bfa8b2f4c8d4567
 *                 fullname:
 *                   type: string
 *                   description: Full name of the user
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 *                   example: johndoe@example.com
 *                 phone_number:
 *                   type: string
 *                   description: User's phone number
 *                   example: 08151128383
 *                 isVerified:
 *                   type: boolean
 *                   description: Whether the user has verified their email or not
 *                   example: true
 *                 referralCode:
 *                   type: string
 *                   description: Unique referral code for the user
 *                   example: user123
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation date
 *                   example: 2025-05-08T18:45:33.160Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last profile update
 *                   example: 2025-05-09T09:30:10.000Z
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ACCOUNT, [auth], (req, res)=>{
    const userController = new UserController()
    return userController.getUser(req, res)
})
router.put(ROUTE_PROFILE_IMAGE_UPLOAD, [auth], (req, res)=>{
    const userController = new UserController()
    return userController.profileImageUpload(req, res)
})
// /**
//  * @swagger
//  * /users/update-account-details:
//  *   put:
//  *     summary: Update account details
//  *     tags:
//  *       - Users
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - accountName
//  *               - bankName
//  *               - accountNumber
//  *             properties:
//  *               accountName:
//  *                 type: string
//  *                 example: John doe
//  *               bankName:
//  *                 type: string
//  *                 example: FTC Bank
//  *               accountNumber:
//  *                 type: string
//  *                 example: 1234567890
//  *     responses:
//  *       201:
//  *         description: Account details added successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Account details added successfully
//  *                 data:
//  *                   type: object
//  *       400:
//  *         description: Missing or invalid fields
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Please enter a valid field 
//  *                 data:
//  *                   type: object
//  *       500:
//  *         description: Internal server error
//  */
// router.put(ROUTE_UPDATE_ACCOUNT_DETAILS, [auth], (req, res)=>{
//     const userController = new UserController()
//     return userController.updateAccountDetails(req, res)
// })

module.exports = router