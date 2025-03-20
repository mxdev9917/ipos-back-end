const errors = require('../utils/errors')
const db = require('../db/connection');

exports.getFoodSales = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const status = "paid";
    try {
        const sql = `
                SELECT 
                    mi.food_ID,
                    SUM(mi.quantity) AS total_quantity, 
                    SUM(o.total_price) AS total_price,
                    f.food_name,
                    c.category,
                    f.price AS food_price
                FROM 
                    Menu_items mi
                JOIN 
                    Orders o ON mi.order_ID = o.order_ID
                JOIN 
                    Foods f ON mi.food_ID = f.food_ID
                JOIN 
                    Categories c ON f.category_ID = c.category_ID
                JOIN 
                    Restaurants r ON f.restaurant_ID = r.restaurant_ID
                WHERE 
                    r.restaurant_ID = ? AND o.order_status = ?
                GROUP BY 
                    mi.food_ID
                ORDER BY 
                    mi.food_ID
                LIMIT ? OFFSET ?

                `;
        const offset = (pageNumber - 1) * pageLimit;
        db.query(sql, [id, status, pageLimit, offset], (error, results) => {
            if (error) {
                console.error("Error fetching food sale report:", error.message);
                return errors.mapError(500, "Error fetching food sale report", next);
            }
            const totalRecords = results.length;
            return res.status(200).json({
                status: "200",
                message: 'Food sales retrieved successfully',
                total_item: totalRecords,
                data: results,
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};

exports.getFoodSalesByCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    // Validate restaurant ID
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }


    const { category_ID } = req.body;
    const { page, limit } = req.body;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const status = "paid";
    console.log({ category_ID, page, limit });


    try {

        const countSql = `
            SELECT COUNT(DISTINCT mi.food_ID) AS total_count
            FROM 
                Menu_items mi
            JOIN 
                Orders o ON mi.order_ID = o.order_ID
            JOIN 
                Foods f ON mi.food_ID = f.food_ID
            JOIN 
                Categories c ON f.category_ID = c.category_ID
            JOIN 
                Restaurants r ON f.restaurant_ID = r.restaurant_ID
            WHERE 
                r.restaurant_ID = ? AND o.order_status = ? AND c.category_ID = ?
        `;
        db.query(countSql, [id, status, category_ID], (countError, countResults) => {
            if (countError) {
                console.error("Error fetching total count:", countError.message);
                return errors.mapError(500, "Error fetching total count", next);
            }
            const totalRecords = countResults[0].total_count;
            const totalPages = Math.ceil(totalRecords / pageLimit);

            // Query for actual data
            const sql = `
                SELECT 
                    mi.food_ID,
                    SUM(mi.quantity) AS total_quantity, 
                    SUM(o.total_price) AS total_price,
                    f.food_name,
                    c.category,
                    f.price AS food_price
                FROM 
                    Menu_items mi
                JOIN 
                    Orders o ON mi.order_ID = o.order_ID
                JOIN 
                    Foods f ON mi.food_ID = f.food_ID
                JOIN 
                    Categories c ON f.category_ID = c.category_ID
                JOIN 
                    Restaurants r ON f.restaurant_ID = r.restaurant_ID
                WHERE 
                    r.restaurant_ID = ? AND o.order_status = ? AND c.category_ID = ?
                GROUP BY 
                    mi.food_ID
                ORDER BY 
                    mi.food_ID
                LIMIT ? OFFSET ?
            `;
            const offset = (pageNumber - 1) * pageLimit;
            db.query(sql, [id, status, category_ID, pageLimit, offset], (error, results) => {
                if (error) {
                    console.error("Error fetching food sale report:", error.message);
                    return errors.mapError(500, "Error fetching food sale report", next);
                }

                return res.status(200).json({
                    status: "200",  // You can return status in the body if needed, but avoid hardcoding HTTP status in body
                    message: 'Food sales retrieved successfully',
                    total_item: totalRecords,
                    total_pages: totalPages,
                    current_page: pageNumber,
                    data: results,
                });
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};
exports.getFoodSalesByDate = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    // Validate restaurant ID
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const status = "paid";
    const { startDate, endDate, page, limit } = req.body;
    
    try {
        // Correct the SQL query
        const sql = `
                SELECT 
                    mi.food_ID,
                    SUM(mi.quantity) AS total_quantity, 
                    SUM(o.total_price) AS total_price,
                    f.food_name,
                    c.category,
                    f.price AS food_price
                FROM 
                    Menu_items mi
                JOIN 
                    Orders o ON mi.order_ID = o.order_ID
                JOIN 
                    Foods f ON mi.food_ID = f.food_ID
                JOIN 
                    Categories c ON f.category_ID = c.category_ID
                JOIN 
                    Restaurants r ON f.restaurant_ID = r.restaurant_ID
                WHERE 
                    r.restaurant_ID = ? 
                    AND o.order_status = ? 
                    AND mi.updated_at BETWEEN ? AND ?
                GROUP BY 
                    mi.food_ID
                ORDER BY 
                    mi.food_ID
        `;
        
        db.query(sql, [id, status, startDate, endDate], (error, results) => {
            if (error) {
                console.error("Error fetching food sale report:", error.message);
                return errors.mapError(500, "Error fetching food sale report", next);
            }

            return res.status(200).json({
                status: "200",
                message: 'Food sales retrieved successfully',

                data: results,
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
}

//         const sql = `SELECT * FROM Menu_items WHERE updated_at BETWEEN ? AND ?  `