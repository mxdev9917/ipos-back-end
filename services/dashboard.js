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
        const totalSales = await totalSale(id, currentDate);
        const timeSales = await timeSale(id, currentDate);
        const timeMenuItems = await timeMenuItem(id, currentDate);
        const tableStatuss = await tableStatus(id, currentDate);
        const orderStatuss = await orderStatus(id, currentDate);
        const MenuItems = await MenuItem(id, currentDate);
        
        return res.status(200).json({
            status: "200",
            message: "Successfully",
            totalSale: totalSales,
            topProduct: topProducts,
            timeSale: timeSales,
            timeMenuItem: timeMenuItems,
            tableStatus: tableStatuss,
            orderStatus: orderStatuss,
            menuItem:MenuItems[0]
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
              f.food_ID,
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
const totalSale = (res_ID, currentDate) => {
    const status = "paid";
    console.log(currentDate);

    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                SUM(mi.quantity) AS total_quantity, 
                COUNT(o.order_ID) AS count_orders 
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
                r.restaurant_ID = ? AND o.order_status = ? AND DATE(o.updated_at) = ? 
        `;

        db.query(sql, [res_ID, status, currentDate], (error, results) => {
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
               o.created_at AS hour,
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
        db.query(sql, [currentDate, restaurantId, orderStatus], (error, results) => {
            if (error) {
                console.error("Error fetching time sales:", error);
                return reject(new Error("Error fetching time sales"));
            }
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
            resolve(results); // Returning all results
        });
    });
};

const tableStatus = (currentDate, restaurantId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
          
            SUM(table_status = 'reserve') AS reserved_count,
            SUM(table_status = 'busy') AS busy_count,
            SUM(table_status = 'empty') AS empty_count
        FROM Tables
        WHERE  restaurant_ID = ?  
        ;`
        db.query(query, [currentDate, restaurantId], (error, results) => {
            if (error) {
                console.error("Error fetching table Status:", error);
                return reject(new Error("Error fetching table Status"));
            }
            resolve(results);
        });
    })
}

const orderStatus = (restaurantId, currentDate) => {
    console.log(restaurantId);

    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
            SUM(order_status = 'paid') AS paid_count,
            SUM(order_status = 'unpaid') AS unpaid_count
        FROM Orders
        WHERE restaurant_ID = ? AND (DATE(created_at) = ? OR DATE(updated_at) = ?);
        `
        db.query(query, [restaurantId, currentDate, currentDate], (error, results) => {
            if (error) {
                console.error("Error fetching table Status:", error);
                return reject(new Error("Error fetching table Status"));
            }
            resolve(results);
        });
    });
}

const MenuItem = (restaurantId, currentDate) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
             SUM(m.quantity) AS qty
        FROM Menu_items m
        JOIN Orders o ON m.order_ID = o.order_ID
        WHERE o.restaurant_ID = ? AND (DATE(m.created_at) = ? OR DATE(m.updated_at) = ?);
        `
        db.query(query, [restaurantId, currentDate, currentDate], (error, results) => {
            if (error) {
                console.error("Error fetching table Status:", error);
                return reject(new Error("Error fetching table Status"));
            }
            resolve(results);
        });
    });
}







