const errors = require('../utils/errors');
const db = require('../db/connection');
const { log, error } = require('winston');
const { and } = require('sequelize');

// Create a new chat message
exports.createChat = async (req, res, next) => {
    try {
        const { restaurant_ID, table_ID, chat_type, messages } = req.body;

        // Get order_ID for the table
        let order_ID;
        try {
            order_ID = await filterOrderID(table_ID);
        } catch (error) {
            return res.status(404).json({
                status: "404",
                message: "No unpaid order found for this table"
            });
        }

        const sql = `
            INSERT INTO chat_messages 
            (restaurant_ID, table_ID, chat_type, messages, order_ID) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [restaurant_ID, table_ID, chat_type, messages, order_ID], (error) => {
            if (error) {
                console.error('Error inserting chat_messages:', error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error"
                });
            }

            return res.status(200).json({
                status: "200",
                message: "Chat message inserted successfully",
            });
        });

    } catch (error) {
        console.error("Unexpected error in creating chat:", error.message);
        return res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
};

// Get all chat messages for a table
exports.getAllChat = async (req, res, next) => {
    try {
        const { restaurant_ID, table_ID, chat_type } = req.body;

        // Validation
        if (!restaurant_ID || !table_ID) {
            return res.status(400).json({
                status: "400",
                message: "restaurant_ID and table_ID are required"
            });
        }
        // Get order_ID for the table
        let order_ID;
        try {
            order_ID = await filterOrderID(table_ID);
        } catch (error) {
            return res.status(404).json({
                status: "404",
                message: "No unpaid order found for this table"
            });
        }

        let sql = `
            SELECT chat_id, chat_type, messages, is_read, sent_at
            FROM chat_messages
            WHERE restaurant_ID = ? AND table_ID = ? AND order_ID = ?
        `;

        const queryParams = [restaurant_ID, table_ID, order_ID];

        if (chat_type) {
            sql += ' AND chat_type = ?';
            queryParams.push(chat_type);
        }

        db.query(sql, queryParams, (error, results) => {
            if (error) {
                console.error('Error fetching chat_messages:', error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error"
                });
            }
            return res.status(200).json({
                status: "200",
                message: 'Fetched chat messages successfully',
                data: results,
            });
        });


    } catch (error) {
        console.error("Unexpected error in getAllChat:", error.message);
        return res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
};

// Count unread chat messages for a table
exports.countMessage = async (req, res, next) => {
    try {
        const { restaurant_ID, table_ID } = req.body;

        // Get order_ID for the table
        let order_ID;
        try {
            order_ID = await filterOrderID(table_ID);
        } catch (error) {
            return res.status(404).json({
                status: "404",
                message: "No unpaid order found for this table"
            });
        }

        const sql = `SELECT COUNT(*) AS message 
            FROM chat_messages 
            WHERE restaurant_ID = ? 
            AND table_ID = ? 
            AND is_read = ? 
            AND chat_type = ? 
            AND order_ID = ?`;

        db.query(sql, [restaurant_ID, table_ID, false, "admin", order_ID], (countError, countResults) => {
            if (countError) {
                console.error('Error counting chat_messages:', countError.message);
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error"
                });
            }

            return res.status(200).json({
                status: "200",
                message: 'Fetched total count of chat messages successfully',
                data: countResults[0],
            });
        });

    } catch (error) {
        console.error("Unexpected error in countMessage:", error.message);
        return res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
};

// Update message read status to true
exports.updateIsRead = async (req, res, next) => {
    try {
        const { restaurant_ID, table_ID, chat_type } = req.body;
        console.log({ restaurant_ID, table_ID, chat_type });


        // Get order_ID for the table
        let order_ID;
        try {
            order_ID = await filterOrderID(table_ID);
        } catch (error) {
            return res.status(404).json({
                status: "404",
                message: "No unpaid order found for this table"
            });
        }

        const selectSQL = `
            SELECT chat_id 
            FROM chat_messages 
            WHERE restaurant_ID = ? AND table_ID = ? AND chat_type = ? AND order_ID = ?
        `;

        db.query(selectSQL, [restaurant_ID, table_ID, chat_type, order_ID], (error, results) => {
            if (error) {
                console.error('Error fetching chat_messages:', error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error"
                });
            }

            if (!results.length) {
                return res.status(200).json({
                    status: "200",
                    message: "No messages to update"
                });
            }

            const chatIds = results.map(row => row.chat_id);

            console.log("Chat IDs to update:", chatIds);

            const updateSQL = `
                UPDATE chat_messages 
                SET is_read = 1 
                WHERE chat_id IN (?) AND is_read = 0
            `;

            db.query(updateSQL, [chatIds], (err, result) => {
                if (err) {
                    console.error('Error updating chat_messages:', err.message);
                    return res.status(500).json({
                        status: "500",
                        message: "Internal server error"
                    });
                }

                console.log("Update result:", result);

                if (result.changedRows === 0) {
                    return res.status(200).json({
                        status: "200",
                        message: "All messages were already marked as read"
                    });
                }

                res.status(200).json({
                    status: "200",
                    message: `${result.changedRows} message(s) marked as read`
                });
            });
        });
    } catch (error) {
        console.error("Unexpected error in updateIsRead:", error.message);
        return res.status(500).json({
            status: "500",
            message: "Internal server error"
        });
    }
};

exports.deleteMessage = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM chat_messages WHERE chat_id = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting message:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'message not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'message deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }

}

exports.getItemMessage = (req, res, next) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    try {
        const status = "unpaid";
        const sql = `
    SELECT 
        t.table_ID,
        t.table_name,
        GROUP_CONCAT(ch.messages SEPARATOR ' || ') AS combined_messages
    FROM chat_messages ch
    JOIN Orders o ON ch.order_ID = o.order_ID
    JOIN Tables t ON o.table_ID = t.table_ID
    WHERE ch.restaurant_ID = ? AND o.order_status = ?
    GROUP BY t.table_ID, t.table_name
`;

        db.query(sql, [id, status], (error, results) => {
            if (error) {
                console.error('Error fetching message:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            return res.status(200).json({
                status: "200",
                message: 'Fetched item messages successfully',
                data: results
            });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};

exports.filterItemMessage = (req, res, next) => {
    const { restaurant_ID, table_name } = req.body;
    try {
        const status = "unpaid";
        const tableSearch = `%${table_name}%`; // Ensures partial matching

        const sql = `
            SELECT 
                ch.chat_id, 
                t.table_name, 
                t.table_ID, 
                ch.messages
            FROM chat_messages ch
            JOIN Orders o ON ch.order_ID = o.order_ID
            JOIN Tables t ON o.table_ID = t.table_ID
            WHERE 
                ch.restaurant_ID = ? 
                AND o.order_status = ? 
                AND t.table_name LIKE ?
                AND ch.chat_id = (
                    SELECT MAX(ch2.chat_id)
                    FROM chat_messages ch2
                    WHERE ch2.order_ID = ch.order_ID
                )
        `;

        db.query(sql, [restaurant_ID, status, tableSearch], (error, results) => {
            if (error) {
                console.error('Error fetching message:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            // if (results.length === 0) {
            //     return res.status(200).json({
            //         status: "404",
            //         message: "No item messages found",
            //         data: []
            //     });
            // }
            return res.status(200).json({
                status: "200",
                message: 'Fetched item messages successfully',
                data: results
            });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};


exports.adminMessage = async (req, res, next) => {
    const { restaurant_ID, table_ID } = req.body;

    // Get order_ID for the table

    let order_ID;
    try {
        order_ID = await filterOrderID(table_ID);
    } catch (error) {
        return res.status(200).json({
            status: "200",
            message: "No unpaid order found for this table",
            data: [],
        });
    }

    try {
        let sql = `
            SELECT ch.chat_id, ch.chat_type, ch.messages, ch.is_read, ch.sent_at,t.table_ID
            FROM chat_messages ch
             JOIN Tables t ON ch.table_ID = t.table_ID
            WHERE ch.restaurant_ID = ? AND ch.table_ID = ? AND ch.order_ID = ?
        `;

        const queryParams = [restaurant_ID, table_ID, order_ID];
        db.query(sql, queryParams, (error, results) => {
            if (error) {
                console.error('Error fetching chat_messages:', error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error"
                });
            }
            return res.status(200).json({
                status: "200",
                message: 'Fetched chat messages successfully',
                data: results,
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}




// Helper function to filter unpaid order
const filterOrderID = (table_ID) => {
    const status = "unpaid";
    return new Promise((resolve, reject) => {
        const sql = `SELECT order_ID FROM Orders WHERE table_ID = ? AND order_status = ? LIMIT 1`;
        db.query(sql, [table_ID, status], (error, results) => {
            if (error) {
                console.error("Error fetching order_ID:", error);
                reject(new Error("Error fetching order_ID"));
                return;
            }

            if (results.length === 0) {
                reject(new Error("No unpaid order found for this table"));
                return;
            }

            resolve(results[0].order_ID);
        });
    });
};


