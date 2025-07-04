const express = require('express')
const router = express.Router()
const authRouter = require('./auth')
const userRouter = require('./users')
const challengeRouter = require('./challenge')
const categoryRouter = require('./category')
const dietRouter = require('./diet')
const productRouter = require('./product')
const utilRouter = require('./util')
// const adminRouter = require('./admin')


router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/utils', utilRouter)
router.use('/challenge', challengeRouter)
router.use('/categories', categoryRouter)
router.use('/diet', dietRouter)
router.use('/products', productRouter)
// router.use('/admin', adminRouter)

module.exports = router