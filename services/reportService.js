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

  
    const { category_ID} = req.body;
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

    const { startDate, endDate, page, limit} = req.body;
    console.log({ startDate, endDate, page, limit});
    

    // // Validate date range
    // if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
    //     return errors.mapError(400, "Invalid date format", next);
    // }

 
    // // Convert startDate and endDate to 'YYYY-MM-DD' format
    // const formattedStartDate = new Date(startDate).toISOString().split('T')[0]; // Extract 'YYYY-MM-DD'
    // const formattedEndDate = new Date(endDate).toISOString().split('T')[0]; // Extract 'YYYY-MM-DD'

    // // Log the formatted dates for debugging
    // console.log("Formatted Start Date:", formattedStartDate);
    // console.log("Formatted End Date:", formattedEndDate);

    // // Default pagination values
    // const pageNumber = page ? Number(page) : 1;
    // const pageLimit = limit ? Number(limit) : 100;
    // const status = "paid"; // Assuming only paid orders are considered

    // console.log({ startDate, endDate, page, limit });

    // try {
    //     // SQL query to get the total count of distinct food items in the given date range
    //     const countSql = `
    //         SELECT COUNT(DISTINCT mi.food_ID) AS total_count
    //         FROM 
    //             Menu_items mi
    //         JOIN 
    //             Orders o ON mi.order_ID = o.order_ID
    //         JOIN 
    //             Foods f ON mi.food_ID = f.food_ID
    //         JOIN 
    //             Categories c ON f.category_ID = c.category_ID
    //         JOIN 
    //             Restaurants r ON f.restaurant_ID = r.restaurant_ID
    //         WHERE 
    //             r.restaurant_ID = ? AND o.order_status = ? AND  mi.created_at BETWEEN ? AND ?
    //     `;
        
    //     // Log the SQL query parameters
    //     console.log("Executing Count SQL Query with params:", [id, status, formattedStartDate, formattedEndDate]);

    //     db.query(countSql, [id, status, formattedStartDate, formattedEndDate], (countError, countResults) => {
    //         if (countError) {
    //             console.error("Error fetching total count:", countError.message);
    //             return errors.mapError(500, "Error fetching total count", next);
    //         }

    //         const totalRecords = countResults[0].total_count;
    //         const totalPages = Math.ceil(totalRecords / pageLimit);

    //         // Log the count and total pages
    //         console.log("Total Records:", totalRecords);
    //         console.log("Total Pages:", totalPages);

    //         // SQL query to get the actual sales data for food items in the given date range
    //         const sql = `
    //             SELECT 
    //                 mi.food_ID,
    //                 SUM(mi.quantity) AS total_quantity, 
    //                 SUM(o.total_price) AS total_price,
    //                 f.food_name,
    //                 c.category,
    //                 f.price AS food_price
    //             FROM 
    //                 Menu_items mi
    //             JOIN 
    //                 Orders o ON mi.order_ID = o.order_ID
    //             JOIN 
    //                 Foods f ON mi.food_ID = f.food_ID
    //             JOIN 
    //                 Categories c ON f.category_ID = c.category_ID
    //             JOIN 
    //                 Restaurants r ON f.restaurant_ID = r.restaurant_ID
    //             WHERE 
    //                 r.restaurant_ID = ? AND o.order_status = ? 
    //             AND mi.created_at BETWEEN ? AND ?
    //             GROUP BY 
    //                 mi.food_ID
    //             ORDER BY 
    //                 mi.food_ID
    //             LIMIT ? OFFSET ?
    //         `;
            
    //         const offset = (pageNumber - 1) * pageLimit;

    //         // Log the SQL query parameters
    //         console.log("Executing Sales Data SQL Query with params:", [id, status, formattedStartDate, formattedEndDate, pageLimit, offset]);

    //         db.query(sql, [id, status, formattedStartDate, formattedEndDate, pageLimit, offset], (error, results) => {
    //             if (error) {
    //                 console.error("Error fetching food sale report:", error.message);
    //                 return errors.mapError(500, "Error fetching food sale report", next);
    //             }

    //             // Log the results
    //             console.log("Results:", results);

    //             // If no results are returned
    //             if (results.length === 0) {
    //                 console.log("No results found for the given criteria.");
    //             }

    //             return res.status(200).json({
    //                 status: "200",
    //                 message: 'Food sales retrieved successfully',
    //                 total_item: totalRecords,
    //                 total_pages: totalPages,
    //                 current_page: pageNumber,
    //                 data: results,
    //             });
    //         });
    //     });
    // } catch (error) {
    //     console.error("Unexpected error:", error.message);
    //     return next(errors.mapError(500, "Internal server error", next));
    // }
}

