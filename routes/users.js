const UserController = require("../controllers/user.controller");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");
const {
  ROUTE_GET_ACCOUNT,
  ROUTE_PROFILE_IMAGE_UPLOAD,
  ROUTE_COMPLETE_ONBOARDING,
  ROUTE_DAILY_NUGGET,
  ROUTE_LIKE_AND_UNLIKE_NUGGET,
  ROUTE_INCREASE_NUGGET_SHARE_COUNT,
  ROUTE_INCREASE_NUGGET_DOWNLOAD_COUNT,
  ROUTE_UPDATE_NUGGET,
  ROUTE_CREATE_NUGGET,
  ROUTE_UPGRADE_PLAN,
  ROUTE_DASHBOARD_STAT,
  ROUTE_LOG_WEIGHT,
  ROUTE_COACH_VERIFICATION_APPLY,
  ROUTE_COACH_VERIFICATIONS,
  ROUTE_COACH_VERIFICATION_REJECT,
  ROUTE_COACH_VERIFICATION_APPROVE,
  ROUTE_LOG_HEIGHT,
  ROUTE_CHANGE_PASSWORD,
  ROUTE_GET_COACHES_BY_SPECIALTY,
  ROUTE_CREATE_PLAN,
  ROUTE_GET_ALL_PLANS,
  ROUTE_GET_PLAN,
  ROUTE_UPDATE_PLAN,
  ROUTE_DELETE_PLAN,
  ROUTE_SUBSCRIBE_PLAN,
  ROUTE_REDEEM_PLAN,
  ROUTE_LOG_SLEEP,
  ROUTE_GET_SLEEP_LOGS,
  ROUTE_LOG_WATER,
  ROUTE_GET_WATER_LOGS,
  ROUTE_GET_NOTIFICATIONS,
  ROUTE_BROADCAST_NOTIFICATION,
} = require("../util/page-route");

const router = require("express").Router();

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
router.get(ROUTE_GET_ACCOUNT, [auth], (req, res) => {
  const userController = new UserController();
  return userController.getUser(req, res);
});
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
router.put(ROUTE_PROFILE_IMAGE_UPLOAD, [auth], (req, res) => {
  const userController = new UserController();
  return userController.profileImageUpload(req, res);
});

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
 *                 type: object
 *                 description: Optional weight of the user
 *                 properties:
 *                   value:
 *                     type: number
 *                     example: 72.5
 *                   unit:
 *                     type: string
 *                     enum: [kg, lbs]
 *                     example: kg
 *               height:
 *                 type: object
 *                 description: Optional height of the user
 *                 properties:
 *                   value:
 *                     type: number
 *                     example: 72
 *                   unit:
 *                     type: string
 *                     enum: [cm, ft]
 *                     example: cm
 *               location:
 *                 type: string
 *                 description: Optional location of the user
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
router.put(ROUTE_COMPLETE_ONBOARDING, [auth], (req, res) => {
  const userController = new UserController();
  return userController.completeOnboarding(req, res);
});
/**
 * @swagger
 * /users/daily-nugget:
 *   get:
 *     summary: Get daily fitness nugget
 *     description: Returns a motivational fitness nugget for the day along with user interaction status.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Daily nugget retrieved successfully
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
 *                       type: object
 *                       properties:
 *                         nugget:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "686265149ba9c6ad79f60bfe"
 *                             title:
 *                               type: string
 *                               example: "Wake up. Work out. Win."
 *                             shares:
 *                               type: integer
 *                               example: 0
 *                             likes:
 *                               type: integer
 *                               example: 1
 *                             downloads:
 *                               type: integer
 *                               example: 0
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-06-30T10:21:08.980Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-07-02T14:22:00.606Z"
 *                             __v:
 *                               type: integer
 *                               example: 1
 *                             likedBy:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["685ec3c9b4a4947cd49fc6c9"]
 *                         hasLiked:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.get(ROUTE_DAILY_NUGGET, auth, (req, res) => {
  const userController = new UserController();
  return userController.getDailyNugget(req, res);
});

/**
 * @swagger
 * /like-unlike-nugget/{id}:
 *   put:
 *     summary: Like or unlike a nugget
 *     description: Toggles the like status for the current user on a specific nugget.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the nugget to like or unlike
 *         schema:
 *           type: string
 *           example: 686265149ba9c6ad79f60bfe
 *     responses:
 *       200:
 *         description: Like status updated successfully
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
 *                   example: Nugget liked successfully
 *       400:
 *         description: Bad request, such as invalid nugget ID
 *       404:
 *         description: Nugget not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_LIKE_AND_UNLIKE_NUGGET + "/:id", auth, (req, res) => {
  const userController = new UserController();
  return userController.likeUnLikeNugget(req, res);
});
/**
 * @swagger
 * /update-nugget/{id}:
 *   put:
 *     summary: Update a nugget
 *     description: Update a nugget title.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of nugget to update
 *         schema:
 *           type: string
 *           example: 686265149ba9c6ad79f60bfe
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
 *                 description: Title of the nugget
 *                 example: The size of a mango can never be determined by its oesophagus. Be wise.
 *     responses:
 *       200:
 *         description: nugget updated successfully
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
 *                   example: Nugget updated successfully
 *       400:
 *         description: Bad request, such as invalid nugget ID
 *       404:
 *         description: Nugget not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_NUGGET + "/:id", adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.editNugget(req, res);
});
/**
 * @swagger
 * /users/create-nugget:
 *   post:
 *     summary: Create a new nugget
 *     tags:
 *       - Users
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
 *                 description: Title of the nugget
 *                 example: The bigger, the better. Keep going
 *     responses:
 *       201:
 *         description: Nugget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nugget created successfully
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_NUGGET, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.editNugget(req, res);
});

/**
 * @swagger
 * /users/increase-nugget-download-count/{id}:
 *   put:
 *     summary: download a nugget
 *     description: records the download status for the current user on a specific nugget.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the nugget to download
 *         schema:
 *           type: string
 *           example: 686265149ba9c6ad79f60bfe
 *     responses:
 *       200:
 *         description: download count updated successfully
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
 *                   example: Nugget downloaded successfully
 *       400:
 *         description: Bad request, such as invalid nugget ID
 *       404:
 *         description: Nugget not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_INCREASE_NUGGET_DOWNLOAD_COUNT + "/:id", auth, (req, res) => {
  const userController = new UserController();
  return userController.increaseNuggetDownloadCount(req, res);
});

/**
 * @swagger
 * /users/increase-nugget-share-count/{id}:
 *   put:
 *     summary: share a nugget
 *     description: records the share status for the current user on a specific nugget.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the nugget to share
 *         schema:
 *           type: string
 *           example: 686265149ba9c6ad79f60bfe
 *     responses:
 *       200:
 *         description: share count updated successfully
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
 *                   example: Nugget shared successfully
 *       400:
 *         description: Bad request, such as invalid nugget ID
 *       404:
 *         description: Nugget not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_INCREASE_NUGGET_SHARE_COUNT + "/:id", auth, (req, res) => {
  const userController = new UserController();
  return userController.increaseNuggetShareCount(req, res);
});

/**
 * @swagger
 * /users/upgrade-plan:
 *   put:
 *     summary: upgrade plan
 *     description: upgrade plan.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: subscription plan upgraded successfully
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
 *                   example: Plan upgraded successfully
 *       400:
 *         description: Bad request, such as invalid nugget ID
 *       404:
 *         description: Nugget not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPGRADE_PLAN, auth, (req, res) => {
  const userController = new UserController();
  return userController.increaseNuggetShareCount(req, res);
});

/**
 * @swagger
 * /users/dashboard-stat:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns dashboard statistics.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Dashboard statistics successfully
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
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 234
 *                         totalDietPlans:
 *                           type: number
 *                           example: 24
 *                         totalWorkoutPlans:
 *                           type: number
 *                           example: 34
 *                         totalVerifiedCoaches:
 *                           type: number
 *                           example: 54
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.get(ROUTE_DASHBOARD_STAT, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.adminDashboardStat(req, res);
});
/**
 * @swagger
 * /users/log-weight:
 *   post:
 *     summary: Log or update the user's weight
 *     description: Allows a logged-in user to record or update their current body weight.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: "72.5"
 *                 description: The weight value
 *               unit:
 *                 type: string
 *                 enum: [kg, lbs]
 *                 default: kg
 *                 example: kg
 *                 description: The unit of the weight
 *     responses:
 *       200:
 *         description: Weight updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Weight updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 72.5
 *                     unit:
 *                       type: string
 *                       example: kg
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-21T10:30:00.123Z
 *       400:
 *         description: Bad request – validation failed
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(ROUTE_LOG_WEIGHT, auth, (req, res) => {
  const userController = new UserController();
  return userController.logUserWeight(req, res);
});

/**
 * @swagger
 * /users/log-height:
 *   post:
 *     summary: Log or update the user's height
 *     description: Allows a logged-in user to record or update their current body height.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: "181"
 *                 description: The height value
 *               unit:
 *                 type: string
 *                 enum: [cm, ft]
 *                 default: cm
 *                 example: cm
 *                 description: The unit of the height
 *     responses:
 *       200:
 *         description: Height updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Height updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 181
 *                     unit:
 *                       type: string
 *                       example: cm
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-21T10:30:00.123Z
 *       400:
 *         description: Bad request – validation failed
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(ROUTE_LOG_HEIGHT, auth, (req, res) => {
  const userController = new UserController();
  return userController.logUserHeight(req, res);
});

/**
 * @swagger
 * /users/coach-verification-apply:
 *   post:
 *     summary: Submit coach verification application
 *     description: Allows a coach to apply for verification with required credentials.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - governmentIssuedId
 *               - coachCertificate
 *               - yearsOfExperience
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               governmentIssuedId:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: https://example.com/id.jpg
 *                   publicId:
 *                     type: string
 *                     example: gov_id_123
 *               coachCertificate:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: https://example.com/cert.jpg
 *                   publicId:
 *                     type: string
 *                     example: cert_456
 *               yearsOfExperience:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Bad request – missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post(ROUTE_COACH_VERIFICATION_APPLY, auth, (req, res) => {
  const userController = new UserController();
  return userController.applyCoachVerificationBadge(req, res);
});

/**
 * @swagger
 * /users/coach-verifications:
 *   get:
 *     summary: Get coach verification applications
 *     description: Fetch all coach applications filtered by status (pending, approved, rejected).
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter applications by verification status
 *     responses:
 *       200:
 *         description: List of coach applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "682d9eeae409bc720a7684ec"
 *                       email:
 *                         type: string
 *                         example: "chiemelapromise30@gmail.com"
 *                       username:
 *                         type: string
 *                         example: "chinedujeremiah2002"
 *                       firstName:
 *                         type: string
 *                         example: "Promise"
 *                       lastName:
 *                         type: string
 *                         example: "Jeremiah"
 *                       phoneNumber:
 *                         type: string
 *                         example: ""
 *                       googleId:
 *                         type: string
 *                         example: "102285321489484478003"
 *                       userType:
 *                         type: string
 *                         example: "user"
 *                       status:
 *                         type: string
 *                         example: "inactive"
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: true
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       servicePlatform:
 *                         type: string
 *                         example: "local"
 *                       age:
 *                         type: integer
 *                         example: 28
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                       location:
 *                         type: string
 *                         example: "promise"
 *                       dailyStreak:
 *                         type: integer
 *                         example: 0
 *                       weeklyStreak:
 *                         type: integer
 *                         example: 0
 *                       lastDailyStreakDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-08T21:14:28.119Z"
 *                       favorites:
 *                         type: array
 *                         items:
 *                           type: string
 *                       weight:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "102"
 *                           unit:
 *                             type: string
 *                             example: "kg"
 *                       height:
 *                         type: object
 *                         properties:
 *                           unit:
 *                             type: string
 *                             example: "ft"
 *                       coachVerification:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: "pending"
 *                       image:
 *                         type: object
 *                         properties:
 *                           imageUrl:
 *                             type: string
 *                             example: "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
 *                           publicId:
 *                             type: string
 *                             example: ""
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-21T09:37:46.773Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-07T10:17:16.153Z"
 *                       otp:
 *                         type: string
 *                         example: ""
 *                       otpExpiresAt:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       __v:
 *                         type: integer
 *                         example: 0
 *       500:
 *         description: Server error
 */
router.get(ROUTE_COACH_VERIFICATIONS, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.getCoachApplications(req, res);
});

/**
 * @swagger
 * /users/coach-verification-reject/{userId}:
 *   put:
 *     summary: Reject a coach verification application
 *     description: Admin rejects a coach's application for verification.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (coach)
 *     responses:
 *       200:
 *         description: Application rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coach application rejected successfully
 *       404:
 *         description: User or application not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_COACH_VERIFICATION_REJECT+"/:userId", adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.rejectCoach(req, res);
});

/**
 * @swagger
 * /users/coach-verification-approve/{userId}:
 *   put:
 *     summary: Approve a coach verification application
 *     description: Admin approves a coach's application for verification.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (coach)
 *     responses:
 *       200:
 *         description: Application approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coach application approved successfully
 *       404:
 *         description: User or application not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_COACH_VERIFICATION_APPROVE+"/userId", adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.approveCoach(req, res);
});

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change user password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: currentPassword123
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *       400:
 *         description: Bad request (e.g. incorrect old password, mismatch, or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Old password is incorrect.
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(ROUTE_CHANGE_PASSWORD, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.approveCoach(req, res);
});

/**
 * @swagger
 * /users/get-coaches-by-specialty:
 *   get:
 *     summary: Get list of coaches filtered by specialties
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: |
 *           One or more specialties to filter coaches by.
 *           Use multiple `specialty` parameters to specify multiple specialties.
 *           Example: ?specialty=yoga&specialty=cardio
 *         required: false
 *         style: form
 *         explode: true
 *     responses:
 *       200:
 *         description: List of matching coaches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 60d21b4667d0d8992e610c85
 *                   firstName:
 *                     type: string
 *                     example: Jane
 *                   lastName:
 *                     type: string
 *                     example: Doe
 *                   specialty:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["yoga", "meditation"]
 *                   userType:
 *                     type: string
 *                     example: coach
 *                   isVerifiedCoach:
 *                     type: boolean
 *                     example: true
 *                   image:
 *                     type: object
 *                     properties:
 *                       imageUrl:
 *                         type: string
 *                         example: https://example.com/jane.jpg
 *                       publicId:
 *                         type: string
 *                         example: abc123
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get(ROUTE_GET_COACHES_BY_SPECIALTY, auth, (req, res) => {
  const userController = new UserController();
  return userController.getCoachBySpecialty(req, res);
});

/**
 * @swagger
 * /users/subscribe-plan:
 *   post:
 *     summary: Subscribe to a plan or gift a subscription
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coachId
 *               - planId
 *               - isGift
 *             properties:
 *               coachId:
 *                 type: string
 *                 description: ID of the coach to subscribe to
 *               planId:
 *                 type: string
 *                 description: ID of the subscription plan
 *               isGift:
 *                 type: boolean
 *                 description: Whether the plan is being gifted
 *               recipientEmail:
 *                 type: string
 *                 description: Email of the gift recipient (required if isGift is true)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date of the gift coupon (optional)
 *     responses:
 *       200:
 *         description: Success (either coupon generated or subscription completed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 couponCode:
 *                   type: string
 *                   description: Returned if the plan is gifted
 *                 message:
 *                   type: string
 *                 subscriptionExpiry:
 *                   type: string
 *                   format: date-time
 *                 plan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     price:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Bad request or missing/invalid fields
 *       404:
 *         description: Coach or plan not found
 *       500:
 *         description: Server error
 */
router.post(ROUTE_SUBSCRIBE_PLAN, auth, (req, res) => {
  const userController = new UserController();
  return userController.subscribePlan(req, res);
});

/**
 * @swagger
 * /users/redeem-plan:
 *   post:
 *     summary: Redeem a gifted subscription using a coupon code
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: The coupon code to redeem
 *     responses:
 *       200:
 *         description: Subscription redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription redeemed successfully
 *       400:
 *         description: Invalid or missing coupon code
 *       403:
 *         description: Coupon not valid for this user or already used
 *       404:
 *         description: Coupon or plan not found
 *       500:
 *         description: Server error
 */
router.post(ROUTE_REDEEM_PLAN, auth, (req, res) => {
  const userController = new UserController();
  return userController.redeemCoupon(req, res);
});

/**
 * @swagger
 * /users/create-plan:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Validation error
 */
router.post(ROUTE_CREATE_PLAN, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.createPlan(req, res);
});

/**
 * @swagger
 * /users/get-all-plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of all plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 */
router.get(ROUTE_GET_ALL_PLANS, auth, (req, res) => {
  const userController = new UserController();
  return userController.getPlans(req, res);
});

/**
 * @swagger
 * /users/get-plan/{id}:
 *   get:
 *     summary: Get a plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The plan ID
 *     responses:
 *       200:
 *         description: The requested plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
 */
router.get(ROUTE_GET_PLAN+"/:id", auth, (req, res) => {
  const userController = new UserController();
  return userController.getPlan(req, res);
});

/**
 * @swagger
 * /users/update-plan/{id}:
 *   put:
 *     summary: Update a plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
 */
router.put(ROUTE_UPDATE_PLAN, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.updatePlan(req, res);
});

/**
 * @swagger
 * /users/delete-plan/{id}:
 *   delete:
 *     summary: Delete a plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 */
router.delete(ROUTE_DELETE_PLAN, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.deletePlan(req, res);
});

/**
 * @swagger
 * /users/log-sleep:
 *   put:
 *     summary: Log last night's sleep hours
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Sleep hours to log
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hours
 *             properties:
 *               hours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 7.5
 *     responses:
 *       200:
 *         description: Sleep entry updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 entry:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     hours:
 *                       type: number
 *       400:
 *         description: Invalid request (e.g., invalid hours)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(ROUTE_LOG_SLEEP, auth, (req, res) => {
  const userController = new UserController();
  return userController.logSleep(req, res);
});

/**
* @swagger
* /users/log-water:
*   put:
*     summary: Log or update today's water intake in litres
*     tags: [Water]
*     security:
*       - bearerAuth: []
*     requestBody:
*       description: Amount of water consumed today (in litres)
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - litres
*             properties:
*               litres:
*                 type: number
*                 minimum: 0
*                 example: 1.5
*     responses:
*       200:
*         description: Water intake logged or updated
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: Water intake updated
*       401:
*         description: Unauthorized
*       500:
*         description: Server error
*/
router.put(ROUTE_LOG_WATER, auth, (req, res) => {
  const userController = new UserController();
  return userController.logWater(req, res);
});

/**
 * @swagger
 * /users/get-sleep-logs:
 *   get:
 *     summary: Get sleep hours for the past 7 days
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sleep data for the last 7 days
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
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-08-13"
 *                       hours:
 *                         type: number
 *                         example: 6.5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_SLEEP_LOGS, auth, (req, res) => {
  const userController = new UserController();
  return userController.getSleepLog(req, res);
});

/**
 * @swagger
 * /users/get-water-logs:
 *   get:
 *     summary: Get today's water intake
 *     tags: [Water]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's water intake data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2025-08-14"
 *                 litres:
 *                   type: number
 *                   example: 1.5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_WATER_LOGS, auth, (req, res) => {
  const userController = new UserController();
  return userController.getWaterLog(req, res);
});

/**
 * @swagger
 * /users/get-notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Returns a list of notifications with title, description, and formatted time (e.g., "Tue, 12:09 PM").
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []   # Assuming JWT Bearer token auth
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
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
 *                       id:
 *                         type: string
 *                         description: Notification ID
 *                         example: "64df2139a1e4f3c00123abcd"
 *                       title:
 *                         type: string
 *                         description: Notification title
 *                         example: "Workout Reminder"
 *                       description:
 *                         type: string
 *                         description: Notification description
 *                         example: "Don't forget to complete your workout today!"
 *                       time:
 *                         type: string
 *                         description: Formatted notification time (e.g., "Tue, 12:09 PM")
 *                         example: "Tue, 12:09 PM"
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_NOTIFICATIONS  , auth, (req, res) => {
  const userController = new UserController();
  return userController.getNotifications(req, res);
});

/**
 * @swagger
 * /users/broadcast-notification:
 *   post:
 *     summary: Send a notification to all regular users (excluding coaches and admins)
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: The notification title
 *                 example: Your workout streak is alive
 *               description:
 *                 type: string
 *                 description: The notification message body
 *                 example: You have logged workouts for day 2. Keep it going - Consistency is your secret weapon!
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification sent to 150 users successfully
 *       400:
 *         description: Bad request - missing title or description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Title and description are required
 *       404:
 *         description: No regular users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No regular users found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post(ROUTE_BROADCAST_NOTIFICATION, adminAuth, (req, res) => {
  const userController = new UserController();
  return userController.broadcastNotification(req, res);
});

module.exports = router;
