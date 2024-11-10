// check param ID 
exports.checkID = (req, res, next, val) => {
    if (Number(val) <= 0) {
        res.status(404).json({ status: "success", Message: "Param not found" });
    }
    else {
        next();
    }
}

// check nul body form owner
exports.checkBodyNull = (req, res, next) => {
    const body = req.body;
    const nullableFields = ['owner_img','user_admin_img'];
    for (let key in body) {
        if (!nullableFields.includes(key) && (body[key] === null || body[key].trim() === "")) {
            return res.status(400).json({ error: `The ${key} field cannot be null or empty.` });
        }
    }
    next();
};




