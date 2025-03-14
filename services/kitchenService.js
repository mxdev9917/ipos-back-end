const errors = require('../utils/errors')
const db = require('../db/connection');

exports.getMenuAll = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return next(errors.mapError(400, "Request parameter invalid type"));
    }
    let body = req.body;

    const { status,ck } = body;
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD
    try {
        const sql = `
            SELECT M.menu_items_ID,M.menu_item_status,F.food_name, F.food_img, M.quantity, M.description, T.table_name
            FROM Menu_items M
            JOIN Orders O ON O.order_ID = M.order_ID
            JOIN Foods F ON F.food_ID = M.food_ID
            JOIN Tables T ON T.table_ID = O.table_ID
            WHERE O.restaurant_ID = ? 
                AND DATE(M.created_at) = ? 
                AND (M.menu_item_status = ? OR M.menu_item_status = ?)
            LIMIT ?
            OFFSET ?;
    `;
        const offset = (pageNumber - 1) * pageLimit;
        db.query(sql, [id, currentDate, status,ck, pageLimit, offset], (error, results) => {
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
                     AND M.menu_item_status = ?;
                     `;
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

exports.statusMenuItem = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return next(errors.mapError(400, "Request parameter invalid type"));
    }

    const { menu_item_status } = req.body;
    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const status = menu_item_status.toLowerCase();

    try {
        const sql = `UPDATE Menu_items SET menu_item_status = ?, updated_at = ? WHERE menu_items_ID = ?`;

        db.query(sql, [status, currentDate, id], (error) => {
            if (error) {
                console.error('Error updating Menu item status:', error.message);
                return next(errors.mapError(500, "Error updating Menu item status"));
            }

            return res.status(200).json({
                status: "200",
                message: "Successfully updated menu item status",
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error.message);
        return next(errors.mapError(500, "Internal server error"));
    }
};
