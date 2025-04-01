// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const errors = require('./errors')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken');
dotenv.config({ path: '../config.env' });


exports.hashPassword = async (password) => {
   try {
      const hash = await bcrypt.hash(password, 10);
      return hash
   } catch (error) {
      console.log(error.message);
      errors.mapError(500, "Internal server error", next)
   }
}
exports.comparePasswrod = async (password, hash) => {
   try {
      const result = await bcrypt.compare(password, hash)
      return result;
   } catch (error) {
      console.log(error.message);
      errors.mapError(500, "Internal server error", next)
   }
}

exports.generateJWT = async (data) => {
   try {
      const token = jwt.sign(data, process.env.JWT_SECERT, { expiresIn: 60 * 60 })
      return token;
   } catch (error) {
      console.log(error.message);
      errors.mapError(500, "Internal server error", next)
   }
}

exports.verifyToken = async (token) => {
   try {
      const result = jwt.verify(token, process.env.JWT_SECERT);
      return result;
   } catch (error) {
      console.log(error.message);
      errors.mapError(500, "Internal server error", next)
   }
}

