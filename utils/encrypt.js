const bcrypt = require('bcrypt');
const errors = require('./errors')

exports.hashPassword = async (password) => {
    try {
       const hash = await bcrypt.hash(password, 10);
       return hash
    } catch (error) {
       console.log(error.message);
       errors.mapError(500, "Internal server error", next)
    }
 }

