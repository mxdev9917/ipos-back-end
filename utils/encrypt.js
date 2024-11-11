const bcrypt = require('bcrypt');
const errors = require('./errors')
const dotenv =require('dotenv')
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
 exports.comparePasswrod=async(password,hash)=>{
   const result =await bcrypt.compare(password,hash)
   return result;
}

 exports.generateJWT=async(data)=>{
   const token=jwt.sign(data,process.env.JWT_SECERT,{ expiresIn: 60 * 60 })
   return token;
 }

