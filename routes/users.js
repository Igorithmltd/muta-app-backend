const UserController = require('../controllers/user.controller')
const auth = require('../middlewares/auth')
const { ROUTE_GET_ACCOUNT, ROUTE_SEED, ROUTE_PROFILE_IMAGE_UPLOAD, ROUTE_UPDATE_ACCOUNT_DETAILS, ROUTE_COMPLETE_ONBOARDING } = require('../util/page-route')

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
/**
 * @swagger
 * /users/profile-image-upload:
 *   put:
 *     summary: Upload or update user's image
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: object
 *                 required:
 *                   - imageUrl
 *                   - publicId
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     format: uri
 *                     description: URL of the uploaded image
 *                     example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *                   publicId:
 *                     type: string
 *                     description: Public ID of the image in the storage service
 *                     example: "sample"
 *     responses:
 *       200:
 *         description: User image updated successfully
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
 *                   example: User image updated successfully
 *       400:
 *         description: Bad request, missing or invalid image object
 *       500:
 *         description: Server error
 */
router.put(ROUTE_PROFILE_IMAGE_UPLOAD, [auth], (req, res)=>{
    const userController = new UserController()
    return userController.profileImageUpload(req, res)
})

/**
 * @swagger
 * /users/complete-onboarding:
 *   put:
 *     summary: Update onboarding information
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - age
 *               - gender
 *               - firstName
 *             properties:
 *               age:
 *                 type: integer
 *                 description: Age of the user
 *                 example: 28
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Gender of the user
 *                 example: female
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *                 example: Sarah
 *               focusArea:
 *                 type: array
 *                 description: Optional list of fitness focus areas
 *                 items:
 *                   type: string
 *                 example: ["weight loss", "muscle gain"]
 *               specialty:
 *                 type: array
 *                 description: Optional list of specialty areas (for coaches)
 *                 items:
 *                   type: string
 *                 example: ["weight loss", "muscle gain"]
 *               fitnessLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 description: Optional fitness level
 *                 example: intermediate
 *               weight:
 *                 type: string
 *                 description: Optional weight of the user
 *                 example: "178 lbs"
 *               height:
 *                 type: string
 *                 description: Optional height of the user
 *                 example: "5'7\""
 *               location:
 *                 type: string
 *                 description: Optional height of the user
 *                 example: "Awka, NG"
 *               yearsOfExperience:
 *                 type: integer
 *                 description: Optional years of experience (for coaches)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Onboarding data updated successfully
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
 *                   example: Onboarding data updated successfully
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.put(ROUTE_COMPLETE_ONBOARDING, [auth], (req, res)=>{
    const userController = new UserController()
    return userController.completeOnboarding(req, res)
})




module.exports = router