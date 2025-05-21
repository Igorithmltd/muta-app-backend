// const SavingController = require('../controllers/saving.controller')
// const auth = require('../middlewares/auth')
// const { ROUTE_CREATE_SAVING, ROUTE_MAKE_SAVING, ROUTE_JOIN_SAVING, ROUTE_ALL_SAVINGS } = require('../util/page-route')

// const router = require('express').Router()

// /**
//  * @swagger
//  * /savings/create-saving:
//  *   post:
//  *     summary: Create a new saving
//  *     tags:
//  *       - Savings
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - title
//  *               - targetAmount
//  *               - frequentAmount
//  *               - frequentTime
//  *               - savingType
//  *               - frequencyDuration
//  *             properties:
//  *               title:
//  *                 type: string
//  *                 example: House Rent Saving
//  *               targetAmount:
//  *                 type: number
//  *                 example: 100000
//  *               frequentAmount:
//  *                 type: number
//  *                 example: "5000"
//  *               frequentTime:
//  *                 type: string
//  *                 example: weekly
//  *               savingType:
//  *                 type: string
//  *                 enum: [personal, group]
//  *                 example: group
//  *               frequencyDuration:
//  *                 type: string
//  *                 example: 1month
//  *               groupDescription:
//  *                 type: string
//  *                 example: This saving is for group members planning to travel.
//  *               dayToBePaid:
//  *                 type: string
//  *                 example: Monday
//  *               memberLimit:
//  *                 type: number
//  *                 example: 10
//  *               groupImage:
//  *                 type: object
//  *                 properties:
//  *                   imageUrl:
//  *                     type: string
//  *                     example: https://example.com/image.jpg
//  *                   publicId:
//  *                     type: string
//  *                     example: saving_images/abc123
//  *     responses:
//  *       201:
//  *         description: Saving created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Saving created successfully
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
// router.post(ROUTE_CREATE_SAVING, [auth], (req, res)=>{
//     const savingController = new SavingController() 
//     return savingController.createSaving(req, res)
// })
// /**
//  * @swagger
//  * /savings/make-saving:
//  *   post:
//  *     summary: Make a saving
//  *     tags:
//  *       - Savings
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - savingId
//  *               - amount
//  *             properties:
//  *               savingId:
//  *                 type: string
//  *                 example: 681cf4b6f0c6b69d89494558
//  *               amount:
//  *                 type: number
//  *                 example: 10000
//  *     responses:
//  *       201:
//  *         description: Saving made successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Saving made successfully
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
// router.post(ROUTE_MAKE_SAVING, [auth], (req, res)=>{
//     const savingController = new SavingController() 
//     return savingController.makeSaving(req, res)
// })
// /**
//  * @swagger
//  * /savings/join-saving:
//  *   post:
//  *     summary: Join a saving
//  *     tags:
//  *       - Savings
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - groupRefferalCode
//  *             properties:
//  *               groupRefferalCode:
//  *                 type: string
//  *                 example: Ref-group-one/16506Do
//  *     responses:
//  *       201:
//  *         description: Saving joined successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Saving joined successfully
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
// router.post(ROUTE_JOIN_SAVING, [auth], (req, res)=>{
//     const savingController = new SavingController() 
//     return savingController.joinSaving(req, res)
// })
// /**
//  * @swagger
//  * /savings:
//  *   get:
//  *     summary: Fetch all savings
//  *     tags:
//  *       - Savings
//  *     responses:
//  *       200:
//  *         description: A list of savings
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   _id:
//  *                     type: string
//  *                     description: The unique identifier for the saving
//  *                   title:
//  *                     type: string
//  *                     description: The title of the saving plan
//  *                   targetAmount:
//  *                     type: number
//  *                     description: The target amount for the saving plan
//  *                   frequentAmount:
//  *                     type: number
//  *                     description: The frequent amount to be paid
//  *                   savingType:
//  *                     type: string
//  *                     enum:
//  *                       - personal
//  *                       - group
//  *                     description: The type of saving plan (personal or group)
//  *                   frequencyDuration:
//  *                     type: string
//  *                     description: The frequency of payment (e.g., 1day, 1month, etc.)
//  *                   interestRate:
//  *                     type: string
//  *                     description: The interest rate for the saving plan
//  *                   groupRefferalCode:
//  *                     type: string
//  *                     description: The referral code for group saving plans
//  *                   startDate:
//  *                     type: string
//  *                     format: date-time
//  *                     description: The start date of the saving plan
//  *                   withdrawalDate:
//  *                     type: string
//  *                     format: date-time
//  *                     description: The withdrawal date of the saving plan
//  *                   savingProgress:
//  *                     type: number
//  *                     description: The current progress of the saving plan
//  *                   isClosed:
//  *                     type: boolean
//  *                     description: Whether the saving plan is closed or not
//  *                   groupMembers:
//  *                     type: array
//  *                     items:
//  *                       type: string
//  *                       description: The list of group members' IDs
//  *                   memberLimit:
//  *                     type: number
//  *                     description: The maximum number of members allowed in a group saving plan
//  *                   groupDescription:
//  *                     type: string
//  *                     description: The description of the group saving plan
//  *       500:
//  *         description: Server error
//  */
// router.get(ROUTE_ALL_SAVINGS, [auth], (req, res)=>{
//     const savingController = new SavingController() 
//     return savingController.allSavings(req, res)
// })

// module.exports = router