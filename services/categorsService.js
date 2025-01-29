const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');

exports.gatAllCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    try {
        const sql = `SELECT category, DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at FROM Categories WHERE restaurant_ID = ? LIMIT ? OFFSET ?;`;
        const offset = (pageNumber - 1) * pageLimit; // Fixed offset calculation

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Categories:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200",
                message: 'Get all Categories successfully',
                data: results,

            });

        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }



}