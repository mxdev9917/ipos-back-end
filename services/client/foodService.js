const errors = require('../../utils/errors');
const db = require('../../db/connection');



exports.getAllfood = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    const status = "active";
    const { page, limit } = req.query;
    const pagenumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const offset = (pagenumber - 1) * pageLimit;  // Fixed offset calculation

    try {
        const sql = `SELECT food_ID, food_name, price,category_ID, food_img 
                     FROM Foods 
                     WHERE restaurant_ID = ? AND food_status = ? 
                     LIMIT ? OFFSET ?`;

        db.query(sql, [id, status, pageLimit, offset], (error, results) => {
            if (error) {
                console.error("Error fetching food:", error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Error fetching food",
                });
            }

            const countSql = `SELECT COUNT(*) AS total FROM Foods WHERE restaurant_ID = ? AND food_status = ?`;

            db.query(countSql, [id, status], (countError, countResults) => {
                if (countError) {
                    console.error('Error fetching Count Food:', countError.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: "Get all Foods successfully",
                    total_item: totalRecords,
                    data: results,
                });
            });
        });

    } catch (fetchError) {
        console.error("Error fetching order details:", fetchError.message);
        return next(errors.mapError(500, "Error fetching order details"));
    }
};

exports.getFoodByName = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Invalid restaurant ID", next);
    }

    const status = "active";
    const { food_name = "" } = req.body;  // Default to empty string if not provided
    const { page, limit } = req.query;
    const pagenumber = page ? Number(page) : 1;
    const pageLimit = limit ? Math.min(Number(limit), 100) : 100;  // Cap limit at 100
    const offset = (pagenumber - 1) * pageLimit;

    try {
        const sql = `SELECT food_ID, food_name, price,category_ID, food_img 
                     FROM Foods 
                     WHERE restaurant_ID = ? AND food_status = ? AND food_name LIKE ?
                     LIMIT ? OFFSET ?`;

        db.query(sql, [id, status, `%${food_name}%`, pageLimit, offset], (error, results) => {
            if (error) {
                console.error("Error fetching food:", error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Error fetching food",
                });
            }

            const countSql = `SELECT COUNT(*) AS total FROM Foods WHERE restaurant_ID = ? AND food_status = ? AND food_name LIKE ?`;

            db.query(countSql, [id, status, `%${food_name}%`], (countError, countResults) => {
                if (countError) {
                    console.error('Error fetching food count:', countError.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                const totalRecords = countResults[0].total;
                const totalPages = Math.ceil(totalRecords / pageLimit);

                return res.status(200).json({
                    status: "200",
                    message: "Get foods by name successfully",
                    total_item: totalRecords,
                    total_pages: totalPages,
                    current_page: pagenumber,
                    data: results,
                });
            });
        });

    } catch (fetchError) {
        console.error("Error fetching order details:", fetchError.message);
        return next(errors.mapError(500, "Error fetching order details"));
    }
};

