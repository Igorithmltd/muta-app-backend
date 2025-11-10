const nodemailer = require("nodemailer");
const { empty } = require("../util");
const BaseService = require("./base");
const validateData = require("../util/validate");

class UtilService extends BaseService {
  async uploadSingleImage(req) {
    try {
      let image = {};
      if (empty(req.file)) {
        return BaseService.sendFailedResponse({
          error: "Please provide an image",
        });
      }

      image = {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      };

      return BaseService.sendSuccessResponse({ message: image });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async uploadDocument(req) {
    try {
      let file = {};
      if (empty(req.file)) {
        return BaseService.sendFailedResponse({
          error: "Please provide a file",
        });
      }

      file = {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      };

      return BaseService.sendSuccessResponse({ message: file });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async uploadSingleVideo(req) {
    try {
      let video = {};
      if (empty(req.file)) {
        return BaseService.sendFailedResponse({
          error: "Please provide a video",
        });
      }
  
      video = {
        videoUrl: req.file.path,
        publicId: req.file.filename,
      };
  
      return BaseService.sendSuccessResponse({ message: video });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }  
  async uploadMultipleImage(req) {
    try {
      let images = [];
      if (empty(req.files)) {
        return BaseService.sendFailedResponse({
          error: "Please provide multiple images",
        });
      }
      images = req.files.map(file=>{
        return {
              imageUrl: file.path,
              publicId: file.filename,
            };
      })

      return BaseService.sendSuccessResponse({ message: images });
    } catch (error) {
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async sendCustomMail(req) {
    try {
      const post = req.body;
      const validateRule = {
        to: "string|required",
        subject: "string|required",
        html: "string|required",
        userEmail: "string|required",
        emailUser: "string|required",
        emailPass: "string|required"
      };

      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string"
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { to, subject, html, userEmail, emailUser, emailPass } = post;

      const mailOptions = {
        from: userEmail,
        to,
        subject,
        html,
      };

      const transporter = this.getEmailTransporter(emailUser, emailPass);
      await transporter.sendMail(mailOptions);

      return BaseService.sendSuccessResponse({
        message: "Email sent successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  getEmailTransporter(emailUser, emailPass) {

    // Create a transporter using your email service provider's SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // or your provider
      port: 465,
      // host: process.env.EMAIL_HOST,
      // port: process.env.EMAIL_PORT,
      // secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: emailUser, // your email
        pass: emailPass, // your email password or app password
      },
    });

    return transporter;
  }
}

module.exports = UtilService;
