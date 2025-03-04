const errors = require('../utils/errors')
const db = require('../db/connection');

exports.getFoodSales = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const sql = `
        SELECT F.*
        FROM Foods F
        LEFT JOIN Categories C ON F.category_ID = C.category_ID
        LEFT JOIN Restaurants R ON F.restaurant_ID = R.restaurant_ID 
        WHERE F.restaurant_ID = ?`;

        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error("Error fetching food sale report:", error.message);
                return errors.mapError(500, "Error fetching food sale report", next);
            }

            if (!results.length) {
                return res.status(404).json({
                    status: "404",
                    message: "No food items found for the given restaurant ID",
                });
            }

            return res.status(200).json({
                status: "200",
                message: "Successfully fetched menu items and total quantity",
                data: results,
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};
