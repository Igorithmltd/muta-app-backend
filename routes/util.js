const UtilController = require('../controllers/util.controller')
const auth = require('../middlewares/auth')
const { image_uploader } = require('../util/imageUpload')
const { ROUTE_IMAGE_UPLOAD_MULTIPLE, ROUTE_IMAGE_UPLOAD_SINGLE, ROUTE_SEND_EMAIL } = require('../util/page-route')

const router = require('express').Router()

router.post(ROUTE_IMAGE_UPLOAD_MULTIPLE, auth, image_uploader.array('file'),(req, res)=>{
    const utilController = new UtilController()
    return utilController.uploadMultipleImage(req, res)
})

router.post(ROUTE_IMAGE_UPLOAD_SINGLE, auth, image_uploader.single('file'), (req, res)=>{
    const utilController = new UtilController()
    return utilController.uploadSingleImage(req, res)
})

router.post(ROUTE_SEND_EMAIL, (req, res)=>{
    const utilController = new UtilController()
    return utilController.sendMailToEmail(req, res)
})

module.exports = router