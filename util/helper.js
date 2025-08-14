const jwt = require('jsonwebtoken')
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET


module.exports.generateOTP = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports.verifyRefreshToken = (token)=> {
    return jwt.verify(token, REFRESH_SECRET);
}
module.exports.signAccessToken = (payload)=> {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "1h" });
}

module.exports.getCurrentWeekNumber = ()=> {
    const date = new Date();
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }
  
  module.exports.formatNotificationTime = (date)=> {
    // Example output: "Tue, 12:09 PM"
    const options = { weekday: "short", hour: "numeric", minute: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }