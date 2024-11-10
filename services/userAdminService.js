const db = require('../db/connection')
const errors = require('../utils/errors')

exports.createUserAdmin = (req, res, next) => {
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
        const sql = `
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
            user_admin_password,
            user_admin_img
        ], (error, results) => {
            if (error) {
                console.error('Error inserting user admin:', error.message);
                // Handle error and forward to error handler
                return next(new Error("Internal server error"));
            }
            // Return success response if no error
            return res.status(200).json({ message: "User created successfully.", data: results });
        });

    } catch (error) {
        console.log(error.message);
        // Pass unexpected errors to the error handler
        return next(new Error("Internal server error"));
    }
};

exports.updateUserAdmin = (req, res, next) => {
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
        const sql = `
            UPDATE User_admins
            SET
                user_admin_name = ?,
                user_admin_email = ?,
                user_admin_status = ?,
                user_admin_phone = ?,
                user_admin_role = ?,
                user_admin_password = ?,
                user_admin_img = ?
            WHERE user_admin_ID = ?`;
        db.query(sql, [
            user_admin_name,
            user_admin_email,
            user_admin_status,
            user_admin_phone,
            user_admin_role,
            user_admin_password,
            user_admin_img,
            id
        ], (error, results) => {
            if (error) {
                console.error('Error updating user admin:', error.message);
                return errors.mapError(500, 'Internal server error', next);
            }
            return res.status(200).json({
                status: "200",
                message: "User admin updated successfully",
                data: results
            });
        });

    } catch (error) {
        console.error('Unexpected error:', error.message);
        return errors.mapError(500, 'Internal server error', next);
    }
};

exports.getAllUserAdmin = (req, res, next) => {
    try {
        const sql = 'SELECT * FROM User_admins';
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching User admins error', error.message);
                errors.mapError(500, 'Internal server error');
                return;
            }
            res.status(200).json({ status: "200", message: "success", data: results });
        });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next)
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
                return errors.mapError(500, 'Internal server error', next);
            }
            res.status(200).json({ status: "200", message: 'success', data: results });
        });


    } catch (error) {
        console.error(error.Message);
        errors.mapError(500, 'Internal server error', next)
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
                return errors.mapError(500, 'Internal server error', next);
            }
            res.status(200).json({ status: "200", message: "user admin deleted successfuly", data: results });
        });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }
}
