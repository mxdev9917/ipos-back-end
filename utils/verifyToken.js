const errors = require('./errors');
const encrypt = require('./encrypt');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return errors.mapError(404, 'Token undefined', next);
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    if (!token) {
        return errors.mapError(401, 'Token missing', next);
    }

    try {
        const tokenValid = await encrypt.verifyToken(token);
        req.user = tokenValid; // Save user info from token if needed
        next(); // Proceed to the next middleware
    } catch (error) {
        console.log(error.message);
        
        if (error.name === "TokenExpiredError") {
            return errors.mapError(401, 'Token expired, please log in again', next);
        }

        return errors.mapError(401, 'Token invalid', next);
    }
};
