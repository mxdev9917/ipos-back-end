const errors = require('../../utils/errors');
const encrypt = require('../../utils/encrypt');
const db = require('../../db/connection');

// ====================== Home Page ======================

exports.homePage = async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const category = await getCategory(id);
        const food = await getAllfood(id);
        const Suggested = await getSuggested(id);
        const slide = await getSlider(id);

        return res.status(200).json({
            status: "200",
            message: "Successfully fetched order",
            category,
            food,
            Suggested,
            slide
        });

    } catch (fetchError) {
        console.error("Error fetching order details:", fetchError.message);
        return next(errors.mapError(500, "Error fetching order details"));
    }
};

// ====================== Get Slider ======================

const getSlider = async (restaurant_ID) => {
    const status = "active";
    return new Promise((resolve, reject) => {
        const sql = `SELECT slider_ID, slider_url FROM Sliders WHERE restaurant_ID = ? AND slider_visibility = ?`;
        db.query(sql, [restaurant_ID, status], (error, results) => {
            if (error) {
                console.error("Error fetching sliders:", error.message);
                return reject(new Error("Error fetching sliders"));
            }

            resolve(results);
        });
    });
};

// ====================== Get Suggested Food ======================

const getSuggested = async (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT food_ID, food_name, price,category_ID, food_img
                     FROM Foods 
                     WHERE restaurant_ID = ? AND suggested = ?`;

        db.query(sql, [restaurant_ID, "true"], (error, results) => {
            if (error) {
                console.error("Error fetching suggested foods:", error.message);
                return reject(new Error("Error fetching suggested foods"));
            }

            if (results.length === 0) {
                return reject(new Error("No suggested foods found"));
            }

            resolve(results);
        });
    });
};

// ====================== Get Categories ======================

const getCategory = async (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT category_ID, category, category_image  
                     FROM Categories 
                     WHERE restaurant_ID = ? AND category_status = ?`;

        db.query(sql, [restaurant_ID, "active"], (error, results) => {
            if (error) {
                console.error("Error fetching categories:", error.message);
                return reject(new Error("Error fetching categories"));
            }

            if (results.length === 0) {
                return reject(new Error("No categories found"));
            }

            resolve(results);
        });
    });
};

// ====================== Get All Food Grouped by Category ======================

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

                // Group foods by category
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
                    message: "Successfully fetched food",
                    food: groupedData
                });
            });
        } catch (error) {
            console.error("Error processing food:", error.message);
            return reject(new Error("Error processing food"));
        }
    });
};

// ====================== Get Food by Name ======================

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
        console.error("Error searching food:", error.message);
        next(error);
    }
};

// ====================== Get Food by Category ID ======================

exports.getFoodByCategoryId = async (req, res, next) => {
    const category_status = "active";
    const food_status = "active";
    const { category_ID } = req.body;

    try {
        const sql = `
            SELECT f.food_ID, f.food_name, f.price, f.food_img, f.category_ID, c.category
            FROM Foods f
            JOIN Categories c ON c.category_ID = f.category_ID
            WHERE f.food_status = ? AND c.category_ID = ? AND c.category_status = ?
        `;

        db.query(sql, [food_status, category_ID, category_status], (error, results) => {
            if (error) {
                console.error("Error fetching food:", error.message);
                return res.status(500).json({
                    status: "500",
                    message: "Error fetching food",
                });
            }

            return res.status(200).json({
                status: "200",
                message: "Successfully fetched food by category ID",
                food: results,
            });
        });
    } catch (error) {
        console.error("Error searching food:", error.message);
        next(error);
    }
};

// ====================== Get QR Code for Table ======================

exports.getQR = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const sql = `SELECT table_token FROM Tables WHERE table_ID = ?`;
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching QR:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            return res.status(200).json({
                status: "200",
                message: 'Fetching QR successfully',
                data: results
            });
        });
    } catch (error) {
        console.error("Unexpected error fetching QR:", error.message);
        next(error);
    }
};
