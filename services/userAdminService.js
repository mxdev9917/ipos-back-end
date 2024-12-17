const db = require('../db/connection');
const errors = require('../utils/errors');
const encrypt = require('../utils/encrypt');

exports.signInUserAdmin = async (req, res, next) => {
    try {
        let body = req.body;
        const {
            user_admin_email,
            user_admin_status,
            user_admin_password,
        } = body;
        const sql = 'SELECT * FROM User_admins WHERE user_admin_email = ?';
        db.query(sql, [user_admin_email], async (error, results) => {
            if (error) {
                console.error('Error fetching use admin by id', error.message);
                return errors.mapError(404, `not found Email : ${user_admin_email}`, next);
            }
            if (results.length === 0) {
                return errors.mapError(404, `not found Email : ${user_admin_email}`, next);
            } else {
                const isPwdValid = await encrypt.comparePasswrod(user_admin_password, results[0].user_admin_password)
                if (!isPwdValid) {
                    return errors.mapError(401, `Password invlalid`, next);
                } else {
                    const isStatusValid = results[0].user_admin_status === 'lock' || results[0].user_admin_status === 'disable';
                    if (isStatusValid) {
                        if (results[0].user_admin_status === "lock") {
                            return errors.mapError(423, `this user is ${results[0].user_admin_status}`, next);
                        } else {
                            return errors.mapError(403, `this user is ${results[0].user_admin_status}`, next);
                        }
                    } else {
                        const token = await encrypt.generateJWT({
                            email: results[0].user_admin_email,
                            user_type: 'administrator',
                             admin_id: results[0].user_admin_ID

                          });
                        res.status(200).json({ status: "200", message: 'success', token: token, data: results });
                    }
                }
            }
        });
    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
}
exports.createUserAdmin = async (req, res, next) => {
    try {
        let body = req.body;
        const {
            user_admin_name,
            user_admin_email,
            user_admin_phone,
            user_admin_role,
            user_admin_password,
            user_admin_img
        } = body;

        // SQL query to insert user admin data
        const sqlcheckEmail = 'SELECT * FROM User_admins WHERE user_admin_email = ?';
        db.query(sqlcheckEmail, [user_admin_email], async (error, results) => {
            if (error) {
                console.error('Error fetching user admin:', error.message);
                // Handle error and forward to error handler
                return errors.mapError(500, 'Error fetching user admin', next);
            }
            if (results.length > 0) {
                return errors.mapError(400, `this Email : ${user_admin_email} is dupkicate`, next);
            } else {
                let sql = `
                INSERT INTO User_admins(
                    user_admin_name,
                    user_admin_email,
                    user_admin_phone,
                    user_admin_role,
                    user_admin_password,
                    user_admin_img
                )
                VALUES (?, ?, ?, ?, ?, ?)`;  // Fixed "VALUE" to "VALUES"

                // Perform the database query
                db.query(sql, [
                    user_admin_name,
                    user_admin_email,
                    user_admin_phone,
                    user_admin_role,
                    await encrypt.hashPassword(user_admin_password), // Use the correct hashPassword function
                    user_admin_img
                ], async (error, results) => {
                    if (error) {
                        console.error('Error inserting user admin:', error.message);
                        // Handle error and forward to error handler
                        return errors.mapError(500, 'Error inserting user admin', next);
                    }

                    // Return success response if no error
                    res.status(200).json({ message: "User created successfully.", data: results });
                    return;
                });
            }

        });
    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
};

exports.updateUserAdmin = async (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert id to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
        }
        const {
            user_admin_name,
            user_admin_email,
            user_admin_status,
            user_admin_phone,
            user_admin_role,
            user_admin_password,
            user_admin_img
        } = req.body;
        const now = new Date();
        const sql = `
            UPDATE User_admins
            SET
                user_admin_name = ?,
                user_admin_email = ?,
                user_admin_status = ?,
                user_admin_phone = ?,
                user_admin_role = ?,
                user_admin_password = ?,
                user_admin_img = ?,
                update_at=?
            WHERE user_admin_ID = ?`;
        db.query(sql, [
            user_admin_name,
            user_admin_email,
            user_admin_status,
            user_admin_phone,
            user_admin_role,
            await encrypt.hashPassword(user_admin_password), // Use the correct hashPassword function
            user_admin_img,
            now,
            id
        ], (error, results) => {
            if (error) {
                console.error('Error updating user admin:', error.message);
                return errors.mapError(500, 'Error updating user admin', next);
            }
            return res.status(200).json({
                status: "200",
                message: "User admin updated successfully",
                data: results
            });
        });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
};

exports.getAllUserAdmin = (req, res, next) => {
    try {
        const sql = 'SELECT * FROM User_admins';
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching User admins error', error.message);
                errors.mapError(500, 'Error fetching User admins error');
                return;
            }
            // Check if the result is empty
            if (results.length === 0) {
                return errors.mapError(404, "No data in database", next)
            }
            res.status(200).json({ status: "200", message: "success", data: results });
        });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }

}

exports.getUserAminById = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'SELECT * FROM User_admins WHERE user_admin_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching use admin by id', error.message);
                return errors.mapError(500, 'Error fetching use admin by id', next);
            }
            if (results.length === 0) {
                return errors.mapError(404, " Data not found", next)
            }
            res.status(200).json({ status: "200", message: 'success', data: results });
        });


    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
}

exports.deleteUserAdmin = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);
        }
        const sql = 'DELETE FROM User_admins WHERE user_admin_ID = ?'
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.log("Error deleting user admin", error.message);
                return errors.mapError(500, 'Error deleting user admin', next);
            }
            res.status(200).json({ status: "200", message: "user admin deleted successfuly", data: results });
        });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
}
