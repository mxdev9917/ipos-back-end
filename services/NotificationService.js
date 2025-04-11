const errors = require('../utils/errors');
const db = require('../db/connection');
const { log } = require('winston');
const { Console } = require('winston/lib/winston/transports');


exports.createNotification = async (restaurant_ID, table_ID, notifications, user_type) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO Notifications (restaurant_ID, table_ID, notifications, user_type) 
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [restaurant_ID, table_ID, notifications, user_type], (error, results) => {
            if (error) {
                console.error("[createNotification] Error inserting notification:", error);
                return reject(new Error("Error inserting notification"));
            }
            resolve(results);
        });
    });
};

exports.editStatusNotification = (req, res, next) => {
    console.log("editStatusNotification called");

    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    const sql = `UPDATE Notifications SET notifications_status = 'readed' WHERE notifications_ID = ?`;

    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error("[editStatusNotification] Error updating notification status:", error);
            return errors.mapError(500, "Internal server error", next);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({
            status: "200",
            message: "Notification status updated successfully"
        });
    });
};


exports.fetchNotification = (req, res, next) => {
    try {
        const { restaurant_ID, table_ID } = req.body;
        const sql = `SELECT * FROM Notifications WHERE restaurant_ID = ? AND table_ID = ? AND user_type=? AND notifications_status="read"`;
        db.query(sql, [restaurant_ID, table_ID, "client"], (error, results) => {
            if (error) {
                console.error("[fetchNotification] Error fetching notifications:", error);
                return next(errors.mapError(500, "Internal server error", next));
            }

            return res.status(200).json({ status: "200", message: 'fetching notification Successfully ', data: results });
        });
    } catch (error) {
        console.error("Unexpected error in get notification:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};

exports.fetchResNotification = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);
        }
        const notifications_status = "read";
        const sql = `SELECT * FROM Notifications WHERE restaurant_ID = ?  AND notifications_status=?`;
        db.query(sql, [id, notifications_status], (error, results) => {
            if (error) {
                console.error("[fetchNotification] Error fetching notifications:", error);
                return next(errors.mapError(500, "Internal server error", next));
            }
            return res.status(200).json({ status: "200", message: 'fetching notification Successfully ', data: results });
        });
    } catch (error) {
        console.error("Unexpected error in get notification:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};
