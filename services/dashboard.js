const errors = require('../utils/errors');
const db = require('../db/connection');

exports.getDashboard = async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    const { currentDate } = req.body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const topProducts = await topProduct(id);
        const totalSales = await totalSale(id);
        const timeSales = await timeSale(id, currentDate);
        const timeMenuItems = await timeMenuItem(id, currentDate);


        return res.status(200).json({
            status: "200",
            message: "Successfully",
            totalSale: totalSales,
            topProduct: topProducts,
            timeSale: timeSales,
            timeMenuItem: timeMenuItems
        });

    } catch (error) {
        console.error("Unexpected error:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};

const topProduct = (res_ID) => {
    const status = "paid";
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
              
                SUM(mi.quantity) AS total_quantity, 
                SUM(o.total_price) AS total_price,
                f.food_name,
                c.category
                
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
                mi.food_ID, f.food_name, f.price, c.category
            ORDER BY 
                total_quantity DESC
            LIMIT 10;
        `;

        db.query(sql, [res_ID, status], (error, results) => {
            if (error) {
                console.error("Error fetching top product :", error);
                return reject(new Error("Error fetching top product"));
            }
            resolve(results);
        });
    });
};
const totalSale = (res_ID) => {
    const status = "paid";
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                SUM(mi.quantity) AS total_quantity, 
                SUM(o.total_price) AS total_price    
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
        `;

        db.query(sql, [res_ID, status], (error, results) => {
            if (error) {
                console.error("Error fetching top product :", error);
                return reject(new Error("Error fetching top product"));
            }
            resolve(results);
        });
    });
};

const timeSale = (restaurantId, currentDate) => {
    const orderStatus = "paid";
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT 
                DATE_FORMAT(o.created_at, '%H:00:00') AS hour,
                SUM(o.total_price) AS total_sales 
            FROM Orders o
            JOIN Tables t ON o.table_ID = t.table_ID  
            JOIN Restaurants r ON t.restaurant_ID = r.restaurant_ID 
            WHERE DATE(o.created_at) = ? 
            AND r.restaurant_ID = ? 
            AND o.order_status = ?
            GROUP BY hour
            ORDER BY hour ASC
        `;

        console.log("Executing query with current date:", currentDate, "restaurant ID:", restaurantId, "and order status:", orderStatus);

        db.query(sql, [currentDate, restaurantId, orderStatus], (error, results) => {
            if (error) {
                console.error("Error fetching time sales:", error);
                return reject(new Error("Error fetching time sales"));
            }
            console.log("Query Result:", results);
            resolve(results); // Returning all results
        });
    });
};

const timeMenuItem = (restaurantId, currentDate) => {


    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(M.created_at, '%H:%i') AS hour,
                SUM(M.quantity) AS qty
            FROM Menu_items M
            JOIN Orders o ON M.order_ID = o.order_ID
              JOIN Tables t ON o.table_ID = t.table_ID  
            JOIN Restaurants r ON t.restaurant_ID = r.restaurant_ID 
            WHERE DATE(M.created_at) = ? AND r.restaurant_ID = ?   
            GROUP BY hour
            ORDER BY hour ASC
        `;


        db.query(query, [currentDate, restaurantId], (error, results) => {
            if (error) {
                console.error("Error fetching MenuItem:", error);
                return reject(new Error("Error fetching MenuItem"));
            }
            console.log("Query Result:", results);
            resolve(results); // Returning all results
        });
    });
};









