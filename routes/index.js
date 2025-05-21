const express = require('express')
const router = express.Router()
const authRouter = require('./auth')
const userRouter = require('./users')
// const savingRouter = require('./saving')
// const utilRouter = require('./util')
// const adminRouter = require('./admin')


router.use('/users', userRouter)
router.use('/auth', authRouter)
// router.use('/savings', savingRouter)
// router.use('/utils', utilRouter)
// router.use('/admin', adminRouter)

module.exports = router