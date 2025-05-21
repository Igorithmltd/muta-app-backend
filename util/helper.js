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