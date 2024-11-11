const db = require('../db/connection');
const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');

exports.signInOwner = (req, res, next) => {
    try {
        let body = req.body;
        const { owner_email, owner_password } = body;
        const sql = 'SELECT * FROM Owners WHERE owner_email = ?';
        db.query(sql, [owner_email], (error, results) => {
            db.query(sql, [owner_email], async (error, results) => {
                if (error) {
                    console.error('Error fetching owners:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                if (results.length === 0) {
                    return errors.mapError(500, `not found is ${owner_email} `, next);
                } else {
                    const isPwdValid = await encrypt.comparePasswrod(owner_password, results[0].owner_password)
                    if (!isPwdValid) {
                        return errors.mapError(401, 'Password invlalid', next);
                    } else {
                        const isStatusValid = results[0].owner_status !== 'lock' || results[0].owner_status !== 'disable'
                        if (!isStatusValid) {
                            return errors.mapError(401, `this user is ${results[0].owner_status}`, next);
                        } else {
                            // create token
                            const token=await encrypt.generateJWT({email:owner_email});
                            return res.status(200).json({ status: "200", message: 'success',token:token, data: results });
                        }
                    }
                }
            });
        });


    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal sever error', next);

    }


}

exports.createOwner = async (req, res, next) => {
    try {
        let body = req.body;
        const {
            owner_name,
            owner_email,
            owner_phone,
            owner_password,
            owner_img
        } = body;
        const query = 'INSERT INTO Owners (owner_name, owner_email, owner_phone,  owner_password, owner_img) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [owner_name, owner_email, owner_phone, await encrypt.hashPassword(owner_password), owner_img], (error, results) => {
            if (error) {
                console.error('Error inserting owner:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ message: 'Owner created successfully', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }

}
exports.updateOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id)
        const {
            owner_name,
            owner_email,
            owner_phone,
            owner_status,
            owner_password,
            owner_img
        } = req.body;

        const query = `
        UPDATE Owners
        SET 
            owner_name = ?, 
            owner_email = ?, 
            owner_phone = ?, 
            owner_status= ?,
            owner_password = ?, 
            owner_img = ?
        WHERE owner_id = ?`;
        db.query(query, [owner_name, owner_email, owner_phone, owner_status, await encrypt.hashPassword(owner_password), owner_img, id], (error, results) => {
            if (error) {
                console.error('Error updating owner:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Owner not found' });
            }
            return res.status(200).json({ message: 'Owner updated successfully', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};
exports.getOwnerById = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'SELECT * FROM Owners WHERE owner_id = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching owners:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'success', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}
exports.getAllOwner = (req, res, next) => {
    try {
        const sql = 'SELECT * FROM Owners';
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching owners:', error.message);
                errors.mapError(error, 500, "Internal server error", next)
                return;
            }
            return res.status(200).json({ status: "200", message: 'success', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}
exports.deleteOwnerById = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Owners WHERE owner_id = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting owner:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Owner not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'Owner deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};


