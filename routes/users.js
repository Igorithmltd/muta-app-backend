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
 *                 type: string
 *                 description: Optional height of the user
 *                 example: "5'7\""
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
 * /userss/increase-nugget-download-count/{id}:
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
 *                 type: number
 *                 example: 72.5
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
 *                       coachVerification:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           submittedAt:
 *                             type: string
 *                             format: date-time
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

module.exports = router;
