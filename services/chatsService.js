const errors = require('../utils/errors');
const db = require('../db/connection');
const { error } = require('winston');

exports.createChat = (req, res, next) => {
    try {
        const { restaurant_ID, table_ID, chat_type, messages } = req.body;
        const sql = `INSERT INTO chat_messages (restaurant_ID, table_ID, chat_type, messages) VALUES (?, ?, ?, ?)`;
        db.query(sql, [restaurant_ID, table_ID, chat_type, messages], (error) => {
            if (error) {
                console.error('Error inserting chat_messages:', error.message);
                return next(errors.mapError(500, "Internal server error"));
            }

            return res.status(200).json({
                status: "200",
                message: "Chat message inserted successfully",
            });
        });
    } catch (error) {

        console.error("Unexpected error in  creating chat:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
}

exports.getAllChat = (req, res, next) => {
    try {
        const { restaurant_ID, table_ID, chat_type } = req.body;
        const { page, limit } = req.query;

        const pageNumber = parseInt(page) || 1;
        const pageLimit = parseInt(limit) || 100;
        const offset = (pageNumber - 1) * pageLimit;

        // Validation
        if (!restaurant_ID || !table_ID) {
            return next(errors.mapError(400, "restaurant_ID and table_ID are required"));
        }

        const sql = `
            SELECT chat_id, chat_type, messages, is_read, sent_at
            FROM chat_messages
            WHERE restaurant_ID = ? AND table_ID = ?
            ${chat_type ? 'AND chat_type = ?' : ''}
            LIMIT ? OFFSET ?
        `;

        const queryParams = chat_type
            ? [restaurant_ID, table_ID, chat_type, pageLimit, offset]
            : [restaurant_ID, table_ID, pageLimit, offset];

        db.query(sql, queryParams, (error, results) => {
            if (error) {
                console.error('Error fetching chat_messages:', error.message);
                return next(errors.mapError(500, "Internal server error"));
            }

            const countSql = `
                SELECT COUNT(*) AS total
                FROM chat_messages
                WHERE restaurant_ID = ? AND table_ID = ?
                ${chat_type ? 'AND chat_type = ?' : ''}
            `;

            const countParams = chat_type
                ? [restaurant_ID, table_ID, chat_type]
                : [restaurant_ID, table_ID];

            db.query(countSql, countParams, (countError, countResults) => {
                if (countError) {
                    console.error('Error counting chat_messages:', countError.message);
                    return next(errors.mapError(500, "Internal server error"));
                }

                const totalRecords = countResults[0].total;

                return res.status(200).json({
                    status: "200",
                    message: 'Fetched chat messages successfully',
                    total_item: totalRecords,
                    current_page: pageNumber,
                    data: results,
                });
            });
        });

    } catch (error) {
        console.error("Unexpected error in getAllChat:", error.message);
        return next(errors.mapError(500, "Internal server error"));
    }
};
