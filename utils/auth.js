
const jwt = require("jsonwebtoken");
require('dotenv').config()
exports.createJWT = async (email, userId, duration) => {
   const payload = {
      email,
      userId,
      duration
   };
   return await jwt.sign(payload, process.env.TOKEN_SECRET, {
     expiresIn: duration,
   });
};