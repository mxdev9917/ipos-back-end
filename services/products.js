const errors = require('../utils/errors');
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');

exports.getAllProduct = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }

    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;

    try {
        const sql = `SELECT p.product_ID, p.product_name, c.category, p.product_status, p.price, p.product_img, p.created_at
                    FROM Restaurants r
                    JOIN Categories c ON r.restaurant_ID = c.restaurant_ID
                    JOIN Products p ON c.category_ID = p.category_ID
                    WHERE r.restaurant_ID = ? LIMIT ? OFFSET ?;`;

        const offset = (pageNumber - 1) * pageLimit;

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Products:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            const countSql = `SELECT COUNT(*) as total FROM Products p WHERE p.restaurant_ID = ?;`;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Products:', countError.message); // Corrected this
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Products successfully',
                    total_item: totalRecords,
                    data: results,
                });
            });
        });

    } catch (error) {
        console.log(error.message); // Add logging here for unexpected errors
        errors.mapError(500, 'Internal server error', next);
    }
};
