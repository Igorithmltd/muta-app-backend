const UtilController = require('../controllers/util.controller')
const auth = require('../middlewares/auth')
const { image_uploader, video_uploader } = require('../util/imageUpload')
const { ROUTE_IMAGE_UPLOAD_MULTIPLE, ROUTE_IMAGE_UPLOAD_SINGLE, ROUTE_SEND_EMAIL, ROUTE_VIDEO_UPLOAD_SINGLE, ROUTE_INITIALIZE_PAYMENT } = require('../util/page-route')

const router = require('express').Router()

router.post(ROUTE_IMAGE_UPLOAD_MULTIPLE, auth, image_uploader.array('file'),(req, res)=>{
    const utilController = new UtilController()
    return utilController.uploadMultipleImage(req, res)
})

/**
 * @swagger
 * /utils/image-upload-single:
 *   post:
 *     summary: Upload a single image file
 *     tags:
 *       - File upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: "https://yourdomain.com/uploads/image123.jpg"
 *                     publicId:
 *                       type: string
 *                       example: "image123"
 *       400:
 *         description: Bad request, e.g., no file uploaded or invalid file
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
 *                   example: No file uploaded
 *       500:
 *         description: Server error
 */
router.post(ROUTE_IMAGE_UPLOAD_SINGLE, auth, image_uploader.single('file'), (req, res)=>{
    const utilController = new UtilController()
    return utilController.uploadSingleImage(req, res)
})

router.post(ROUTE_VIDEO_UPLOAD_SINGLE, auth, video_uploader.single('file'), (req, res)=>{
    const utilController = new UtilController()
    return utilController.uploadSingleVideo(req, res)
})

/**
 * @swagger
 * /utils/initialize-payment:
 *   post:
 *     summary: Initialize a Paystack payment
 *     description: Initializes a Paystack transaction for a user subscribing to a fitness plan. Returns an authorization URL that the user can use to complete payment.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - amount
 *               - planId
 *               - categoryId
 *             properties:
 *               email:
 *                 type: string
 *                 example: "chiemelapromise30@gmail.com"
 *                 description: The user's email address
 *               amount:
 *                 type: string
 *                 example: "4500000"
 *                 description: Amount in kobo (₦1 = 100 kobo)
 *               planId:
 *                 type: string
 *                 example: "64ab12fcd09a7f34b1d5a9c2"
 *                 description: Internal ID of the selected plan
 *               coachId:
 *                 type: string
 *                 example: "64ab12fcd09a7f34b1d5a9c2"
 *                 description: Internal ID of the selected coach
 *               categoryId:
 *                 type: string
 *                 example: "64ab13ffd09a7f34b1d5a9d9"
 *                 description: The plan category id
 *               paystackSubscriptionCode:
 *                 type: string
 *                 example: "PLN_d09ab1d5a9d9"
 *                 description: The paystack plan id
 *               isGift:
 *                 type: boolean
 *                 example: true
 *                 description: Whether it is a gift or not
 *               recipientEmail:
 *                 type: string
 *                 example: "abc@gmail.com"
 *                 description: email of the recipient of the subscription
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                   example: Payment initialized successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       example: "https://checkout.paystack.com/2v4t6w4s8s"
 *                     access_code:
 *                       type: string
 *                       example: "ACCESS_23s5z3m0ha"
 *                     reference:
 *                       type: string
 *                       example: "T513406671019712"
 *       400:
 *         description: Validation error — missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   example:
 *                     email: ["email is required"]
 *                     amount: ["amount is required"]
 *       500:
 *         description: Server error during payment initialization
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
 *                   example: "An internal server error occurred. Please try again later."
 */
router.post(ROUTE_INITIALIZE_PAYMENT, auth, (req, res)=>{
    const utilController = new UtilController()
    return utilController.initializePayment(req, res)
})

router.post(ROUTE_SEND_EMAIL, (req, res)=>{
    const utilController = new UtilController()
    return utilController.sendMailToEmail(req, res)
})

module.exports = router