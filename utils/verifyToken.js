const errors = require('./errors');
const encrypt = require('./encrypt');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return errors.mapError(404, 'Token undefined', next);  // No Authorization header
    }
    // Check if the Authorization header is in the correct "Bearer <token>" format
    let token = authHeader.split(' ')[1];  // Assuming the format is "Bearer <token>"
    if (!token) {
        return errors.mapError(401, 'Token missing', next);
    }
    try {
        const tokenValid = await encrypt.verifyToken(token);
    } catch (error) {
        console.log(error.message);
        errors.mapError(401, 'Token invalid', next);
    }
    next();

}
