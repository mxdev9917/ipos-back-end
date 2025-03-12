const errors = require('../utils/errors')
const db = require('../db/connection');

exports.getMenuAll = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return next(errors.mapError(400, "Request parameter invalid type"));
    }
    const { page, limit, status } = req.body;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD
    // const status = "pending";

    
    try {
        const sql = `
            SELECT F.food_name, F.food_img, M.quantity, M.description, T.table_name
            FROM Menu_items M
            JOIN Orders O ON O.order_ID = M.order_ID
            JOIN Foods F ON F.food_ID = M.food_ID
            JOIN Tables T ON T.table_ID = O.table_ID
            WHERE O.restaurant_ID = ? 
              AND DATE(M.created_at) = ? 
              AND M.menu_item_status = ?
            LIMIT ?
            OFFSET ?;
        `;
        const offset = (pageNumber - 1) * pageLimit;
        db.query(sql, [id, currentDate, status, pageLimit, offset], (error, results) => {
            if (error) {
                console.error("Error fetching menu items:", error.message);
                return next(errors.mapError(500, "Error fetching menu items"));
            }

            const countSql = `
                  SELECT COUNT(*) as total FROM Menu_items M 
                  JOIN Orders O ON O.order_ID = M.order_ID
                  JOIN Foods F ON F.food_ID = M.food_ID
                  JOIN Tables T ON T.table_ID = O.table_ID
                  WHERE O.restaurant_ID = ? 
                     AND DATE(M.created_at) = ? 
                     AND M.menu_item_status = ?;`;
            db.query(countSql, [id, currentDate, status], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Foods:', countError.message); // Corrected this
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Menu  successfully',
                    total_item: totalRecords,
                    data: results,
                });
            });
        });

    } catch (error) {
        console.error("Internal server error:", error.message);
        return next(errors.mapError(500, "Internal server error"));
    }
};
