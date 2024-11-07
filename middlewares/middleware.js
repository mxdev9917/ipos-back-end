// check param ID 
exports.checkID = (req, res, next, val) => {
    if (Number(val) <= 0) {
        res.status(404).json({ status: "success", Message: "Param not found" });
    }
    else {
        next();
    }
}


