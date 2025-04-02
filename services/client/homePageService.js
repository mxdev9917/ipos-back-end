
const errors = require('../../utils/errors')
const encrypt = require('../../utils/encrypt');
const db = require('../../db/connection');

exports.homePage = async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a numbersa
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {

        const category = await getCategory(id);
        const food = await getAllfood(id);

        return res.status(200).json({
            status: "200",
            message: "Successfully fetched order",
            category,
            food
        });

    } catch (fetchError) {
        console.error("Error fetching order details:", fetchError.message);
        return next(errors.mapError(500, "Error fetching order details"));
    }

}

const getCategory = async (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT category_ID, category, category_image  
                     FROM Categories 
                     WHERE restaurant_ID = ? AND category_status = ?`;

        db.query(sql, [restaurant_ID, "active"], (error, results) => {
            if (error) {
                console.error("Error fetching category:", error.message);
                return reject(new Error("Error fetching category"));
            }

            if (results.length === 0) {
                return reject(new Error("No categories found"));
            }

            resolve(results);
        });
    });
};

const getAllfood = (id) => {
    const category_status = "active";
    const food_status = "active";
    return new Promise((resolve, reject) => {
        try {
            const sql = `SELECT f.food_ID, f.food_name, f.price, f.food_img, f.category_ID, c.category
                         FROM Foods f
                         JOIN Categories c ON c.category_ID = f.category_ID
                         WHERE f.restaurant_ID = ? 
                         AND c.category_status = ? 
                         AND f.food_status = ?
                         ORDER BY c.category_ID, f.food_ID`;

            db.query(sql, [id, category_status, food_status], (error, results) => {
                if (error) {
                    console.error("Error fetching food:", error.message);
                    return reject(new Error("Error fetching food"));
                }

                // Transform data into grouped format
                const groupedData = results.reduce((acc, food) => {
                    if (!acc[food.category]) {
                        acc[food.category] = [];
                    }
                    acc[food.category].push({
                        category_ID: food.category_ID,
                        food_ID: food.food_ID,
                        food_name: food.food_name,
                        price: food.price,
                        food_img: food.food_img
                    });
                    return acc;
                }, {});

                resolve({
                    status: "200",
                    message: "Successfully fetched order",
                    food: groupedData
                });
            });
        } catch (error) {
            console.error("Error fetching food details:", error.message);
            return reject(new Error("Error fetching food details"));
        }
    });
};
exports.getFoodByName = async (req, res, next) => {
    const category_status = "active";
    const food_status = "active";
    const { food_name, restaurant_ID } = req.body;

    try {
        const sql = `
            SELECT f.food_ID, f.food_name, f.price, f.food_img, f.category_ID, c.category
            FROM Foods f
            JOIN Categories c ON c.category_ID = f.category_ID
            WHERE f.restaurant_ID = ? 
            AND c.category_status = ? 
            AND f.food_status = ?
            AND f.food_name LIKE ?
        `;

        db.query(sql, [restaurant_ID, category_status, food_status, `%${food_name}%`], (error, results) => {
            if (error) {
                console.error("Error fetching food:", error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Error fetching food",
                });
            }

            return res.status(200).json({
                status: "200",
                message: "Successfully fetched food by name",
                food: results,
            });
        });
    } catch (error) {
        console.error("Error fetching food details:", error.message);
        next(error); // Pass the error to Express error handler
    }
};

exports.getFoodByCategoryId = async (req, res, next) => {
    const category_status = "active";
    const food_status = "active";
    const { food_name, restaurant_ID } = req.body;

    try {
        const sql = `
            SELECT f.food_ID, f.food_name, f.price, f.food_img, f.category_ID, c.category
            FROM Foods f
            JOIN Categories c ON c.category_ID = f.category_ID
            WHERE f.restaurant_ID = ? 
            AND c.category_status = ? 
            AND f.food_status = ?
            AND f.category_ID = ?
        `;

        db.query(sql, [restaurant_ID, category_status, food_status, `%${food_name}%`], (error, results) => {
            if (error) {
                console.error("Error fetching food:", error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Error fetching food",
                });
            }

            return res.status(200).json({
                status: "200",
                message: "Successfully fetched food by name",
                food: results,
            });
        });
    } catch (error) {
        console.error("Error fetching food details:", error.message);
        next(error); // Pass the error to Express error handler
    }
};




