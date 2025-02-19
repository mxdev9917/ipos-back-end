const errors = require('../utils/errors');
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');
const upload = require('../utils/multerConfig');
const insertPathImg = require("../utils/insertPathImg");
exports.getAllfood = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }

    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;

    try {
        const sql = `SELECT p.food_ID, p.food_name, c.category, p.food_status, p.price, p.food_img, p.created_at
                    FROM Restaurants r
                    JOIN Categories c ON r.restaurant_ID = c.restaurant_ID
                    JOIN Foods p ON c.category_ID = p.category_ID
                    WHERE r.restaurant_ID = ? LIMIT ? OFFSET ?;`;

        const offset = (pageNumber - 1) * pageLimit;

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Foods:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            const countSql = `SELECT COUNT(*) as total FROM Foods p WHERE p.restaurant_ID = ?;`;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Foods:', countError.message); // Corrected this
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Foods successfully',
                    total_item: totalRecords,
                    data: results,
                });
            });
        });

    } catch (error) {
        console.log(error.message); // Add logging here for unexpected errors
        errors.mapError(500, 'Internal server error', next);
    }
};

exports.getByIdfood = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const sql = `
            SELECT p.food_name,p.price,c.category_ID, c.category ,p.food_img
            FROM Foods p
            JOIN Categories c ON c.category_ID = p.category_ID
            WHERE p.food_ID = ?
        `;

        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error("Error fetching Foods:", error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: "food fetched successfully", data: results });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};

exports.getByIdCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id); // Convert id to a number
    const { page, limit } = req.query; // Use query params instead of body
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const offset = (pageNumber - 1) * pageLimit;

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    const status = "active";
    
    const sql = `
        SELECT  p.food_ID, p.food_name, p.price, c.category_ID, c.category, p.food_img
        FROM Foods p
        JOIN Categories c ON c.category_ID = p.category_ID
        WHERE c.category_ID = ? AND p.food_status = ? 
        LIMIT ? OFFSET ?
    `;

    db.query(sql, [id, status, pageLimit, offset], (error, results) => {
        if (error) {
            console.error("Error fetching Foods:", error.message);
            return errors.mapError(500, "Internal server error", next);
        }

        // Count total items
        const countSql = `SELECT COUNT(*) as total FROM Foods WHERE category_ID = ?`;
        db.query(countSql, [id], (countError, countResults) => {
            if (countError) {
                console.error("Error counting Foods:", countError.message);
                return errors.mapError(500, "Internal server error", next);
            }

            // Ensure countResults is not empty
            const totalRecords = countResults.length > 0 ? countResults[0].total : 0;

            return res.status(200).json({
                status: 200,
                message: "Get all foods successfully",
                total_item: totalRecords, // Ensure this is properly returned
                data: results,
            });
        });
    });
};


exports.createfood = (req, res, next) => {
    upload.single("food_img")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { category_ID, restaurant_ID, food_name, price, gallery_path } = req.body;
        const food_img = req.file ? `/images/food_img/${req.file.filename}` : gallery_path || null;

        if (!category_ID || !restaurant_ID || !food_name || !price) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        console.log(food_img);

        try {
            if (!gallery_path) {
                await insertPathImg(food_img);
            }

            const checkSql = `SELECT food_name FROM Foods WHERE food_name = ? AND restaurant_ID = ?`;
            db.query(checkSql, [food_name, restaurant_ID], (error, results) => {
                if (error) {
                    console.error("Error fetching food:", error.message);
                    return errors.mapError(500, "Internal server error", next);
                }
                if (results.length > 0) {
                    return res.status(409).json({ message: `food '${results[0].food_name}' already exists.` });
                }
                const insertSql = `INSERT INTO Foods (category_ID, restaurant_ID, food_name, price, food_img) VALUES (?, ?, ?, ?, ?)`;
                db.query(insertSql, [category_ID, restaurant_ID, food_name, price, food_img], (error, results) => {
                    if (error) {
                        console.error("Error inserting food:", error.message);
                        return errors.mapError(500, "Internal server error", next);
                    }

                    return res.status(201).json({
                        status: "201",
                        message: "food created successfully",
                        data: {
                            food_ID: results.insertId,
                            category_ID,
                            restaurant_ID,
                            food_name,
                            price,
                            food_img,
                        },
                    });
                });
            });
        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next);
        }
    });
};

exports.editfood = (req, res, next) => {
    upload.single("food_img")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        const { food_ID, category_ID, food_name, price, gallery_path } = req.body;
        const food_img = req.file ? `/images/food_img/${req.file.filename}` : gallery_path || null;
        try {
            if (food_img != null) {
                if (!gallery_path) {
                    await insertPathImg(food_img);
                }
                const updateSql = `UPDATE Foods 
                    SET category_ID = ?, 
                        food_name = ?, 
                        price = ?, 
                        food_img = ? 
                    WHERE food_ID = ?`;
                db.query(updateSql, [category_ID, food_name, price, food_img, food_ID], (error, results) => {
                    if (error) {
                        console.error("Error updating food:", error.message);
                        return errors.mapError(500, "Internal server error", next);
                    }

                    return res.status(200).json({
                        status: "200",
                        message: "food updated successfully",
                    });
                });
            } else {
                const updateSql = `UPDATE Foods 
                    SET category_ID = ?, 
                        food_name = ?, 
                        price = ?
                    WHERE food_ID = ?`;
                db.query(updateSql, [category_ID, food_name, price, food_ID], (error, results) => {
                    if (error) {
                        console.error("Error updating food:", error.message);
                        return errors.mapError(500, "Internal server error", next);
                    }
                    return res.status(200).json({
                        status: "200",
                        message: "food updated successfully",

                    });
                });
            }




        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next);
        }
    });


};

exports.deletefood = (req, res, next) => {

    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Foods WHERE food_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting Foods:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Foods not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'Foods deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }


}

exports.editStatusfood = (req, res, next) => {


    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { food_status, updated_at } = body;


    console.log({ food_status, updated_at });


    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Foods SET food_status=?,updated_at=? WHERE food_ID =?`;
        db.query(sql, [food_status, updated_at, id], (error, results) => {
            if (error) {
                console.error('Error update Foods:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'Foods edit successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }

}

exports.getFoodByStatus = (req, res, next) => {
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

    const sql = `SELECT food_ID,food_name,price,food_img FROM Foods WHERE restaurant_ID = ? AND food_status = ? LIMIT ? OFFSET ?;`;

    db.query(sql, [id, status, pageLimit, offset], (error, results) => {
        if (error) {
            console.error('Error fetching Food:', error.message);
            return errors.mapError(500, "Internal server error", next);
        }

        const countSql = `SELECT COUNT(*) AS total FROM Foods WHERE restaurant_ID = ? AND food_status = ?;`;
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
};



