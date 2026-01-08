const auth = require("./auth");

async function coachAuth(req, res, next) {
  try {
    auth(req, res, () => {
      if (req.user.userType == "coach") {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          data: {
            error: "Access denied. Coaches only",
          },
        });
      }
    });
  } catch (error) {
    console.log(error, "the coach auth error");
  }
}

module.exports = coachAuth;
