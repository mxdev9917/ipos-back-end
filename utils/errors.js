// check path
exports. pathError = (req, res,next) => {
    const err = new Error();
    err.status = `Path ${req.originalUrl} not found in the server`
    err.statusCode = 404
    next(err)
};


exports.ApiError = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error"
    res.status(err.statusCode).json(
        {
            status: err.statusCode,
            message: err.status

        })
});

exports.mapError = ( status, msg,next) => {
    let error = Error()
    error.statusCode = status;
    error.status = msg;
  next (error)
} 