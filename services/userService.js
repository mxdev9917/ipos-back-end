const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');
exports.getUserById = (req, res, next) => {
    let { id } = req.params;
    id = Number(id); // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next); // Return a 400 for invalid ID
    }
    try {
        const sql = 'SELECT user_ID, user_name,user_phone,  user_role, user_img FROM Users WHERE user_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching user:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            if (results.length > 0) {
                return res.status(200).json({
                    status: "200",
                    message: "Get Users successfully",
                    data: results
                });
            } else {
                return res.status(404).json({
                    status: "404",
                    message: `User with ID ${id} not found`
                });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error.message);
        return errors.mapError(500, "Internal server error", next);
    }
};



exports.getAllUserById = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }

    // Get pagination and sorting parameters from the request
    const { page, limit } = req.query;



    // Set default values for pagination and sorting
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    try {
        const sql = `
            SELECT user_ID, user_name, user, user_status, user_role, user_phone, user_img, 
            DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at 
            FROM Users 
            WHERE restaurant_ID = ?
            LIMIT ? OFFSET ?;`;

        const offset = (pageNumber - 1) * pageLimit;  // Calculate the offset for pagination

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error retrieving users:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200",
                message: 'Get all Users successfully',
                data: results,

            });

            
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
};

exports.editUser = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { user_name, user_phone, user_role, user_img } = body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Users SET user_name=?,user_phone=?,user_role=?,user_img=? WHERE user_ID =?`;
        db.query(sql, [user_name, user_phone, user_role, user_img, id], (error, results) => {
            if (error) {
                console.error('Error inserting user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'Users edit successfully', data: results });

        })
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
}
exports.resetPassword = async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }

    try {
        const sql = `UPDATE Users SET user_password=? WHERE user_ID =?`;
        const newPassword = await encrypt.hashPassword("12345678");  // Encrypt the new password

        // Wrap db.query in a promise to use async/await
        const queryPromise = new Promise((resolve, reject) => {
            db.query(sql, [newPassword, id], (error, results) => {
                if (error) {
                    console.log('Error updating user status:', error);
                    reject(new Error("Error updating user status"));
                } else {
                    resolve(results);
                }
            });
        });

        // Wait for the query to finish
        const results = await queryPromise;

        // Send success response
        return res.status(200).json({
            status: "200",
            message: 'Password reset successfully',
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
};

exports.updateStatus = async (req, res, next) => {

    let { id } = req.params;
    id = Number(id);  // Convert id to a number

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    let body = req.body;
    const {  user_status } = body;
    console.log(user_status);

        try {
            const sql = `UPDATE Users SET user_status=? WHERE user_ID =?`;
            // Wrap db.query in a promise to use async/await
            const queryPromise = new Promise((resolve, reject) => {
                db.query(sql, [user_status, id], (error, results) => {
                    if (error) {
                        console.log('Error updating  status:', error);
                        reject(new Error("Error updating  status"));
                    } else {
                        resolve(results);
                    }
                });
            });

            // Wait for the query to finish
            const results = await queryPromise;

            // Send success response
            return res.status(200).json({
                status: "200",
                message: 'Update status successfully',
            });

        } catch (error) {
            console.log(error.message);
            errors.mapError(500, 'Internal server error', next);
        }
};



exports.checkUser = (req, res, next) => {
    const user = req.body.user || req.body.user_mane;
    try {
        const sql = 'SELECT * FROM Users WHERE user = ?';
        db.query(sql, [user], (error, results) => {
            if (error) {
                console.error('Error inserting user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length > 0) {
                return res.status(200).json({ status: "409", message: `This ${user} already used ` });
            }
            return res.status(200).json({ status: "200", message: `This ${user} is available` });
        });
    } catch (error) {

        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
}

exports.createUser = async (req, res, next) => {
    try {
        let body = req.body;
        console.log(body)
        const { restaurant_ID, user_name, user, user_phone, user_password, user_role, user_img } = body;
        const sql = 'SELECT * FROM Users WHERE user = ?';
        db.query(sql, [user], async (error, results) => {
            if (error) {
                console.error('Error inserting user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length > 0) {
                return res.status(409).json({ message: `User is ${user} already used ` });
            }
            const sql = 'INSERT INTO Users(restaurant_ID,user_name,user,user_phone,user_password,user_role,user_img) VALUES(?,?,?,?,?,?,?)'
            db.query(sql, [restaurant_ID, user_name, user, user_phone, await encrypt.hashPassword(user_password), user_role, user_img], (error, results) => {
                if (error) {
                    console.error('Error inserting user:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                return res.status(200).json({ status: "200", message: 'Users create successfully', data: results });
            })


        })
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);

    }
}

exports.deleteUser = (req, res, next) => {
    // return res.status(200).json({ message: 'Users create successfully' });
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Users WHERE user_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'user not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'user deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}

exports.signInUser = (req, res, next) => {

}