const UtilService = require("../services/util.service");
const { sendMail } = require("../util/emailService");
const  BaseController = require("./base");

class UtilController extends BaseController{
    async uploadMultipleImage(req, res){
        const utilService = new UtilService()
        const multipleFileUpload = await utilService.uploadMultipleImage(req)
        if(!multipleFileUpload.success){
            return BaseController.sendFailedResponse(res, multipleFileUpload.data)
        }
        return BaseController.sendSuccessResponse(res, multipleFileUpload.data)
    }
    
    async uploadSingleImage(req, res){
        const utilService = new UtilService()
        const singleFileUpload = await utilService.uploadSingleImage(req)
        if(!singleFileUpload.success){
            return BaseController.sendFailedResponse(res, singleFileUpload.data)
        }
        return BaseController.sendSuccessResponse(res, singleFileUpload.data)
    }

    async sendMailToEmail(req, res){
        const {email, subject, message} = req.body
        const to = ["chiemelapromise30@gmail.com", "willzobiora@gmail.com"]
        if(!email || !subject || !message){
            return UtilController.sendFailedResponse(res, 'Please provide all details')
        }
        const payload = {
            to,
            from: email,
            subject: subject || 'Contact email from customer',
            html: message
        }
        const sendEmail = await sendMail(payload)
        return BaseController.sendSuccessResponse(res, 'Email sent!')
    }
}

module.exports = UtilController