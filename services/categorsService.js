const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');
const upload = require('../utils/multerConfig');
const insertPathImg = require("../utils/insertPathImg");
exports.gatAllCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    try {
        const sql = `SELECT category_ID, category,category_status,category_image,category_status, DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at  FROM Categories WHERE restaurant_ID = ? LIMIT ? OFFSET ?;`;
        const offset = (pageNumber - 1) * pageLimit; // Fixed offset calculation

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Categories:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            const countSql = `SELECT COUNT(*) as total FROM Categories WHERE restaurant_ID = ? `;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Catrgory:', error.message);
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Users successfully',
                    total_item: totalRecords,
                    data: results,

                });
            });


        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }



}
exports.getCategoryById = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const checkSql = `SELECT category  FROM Categories WHERE category_ID =? `;
        db.query(checkSql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching category:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length <= 0) {
                return res.status(409).json({ message: `Not found Category Id` });
            }
            return res.status(200).json({ status: "200", message: 'Category fetching successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }


}
exports.getCategoryByStatus = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    const status = "active"
    try {
        const checkSql = `SELECT category_ID, category,category_image  FROM Categories WHERE  restaurant_ID = ? AND category_status =? `;
        db.query(checkSql, [id, status], (error, results) => {
            if (error) {
                console.error('Error fetching category:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length <= 0) {
                return res.status(409).json({ message: `Not found Category Id` });
            }
            return res.status(200).json({ status: "200", message: 'Category fetching successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }


}

exports.createCategory = (req, res, next) => {
    // Handle file upload
    upload.single("category_img")(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(400).json({ message: err.message });
        }

        const { restaurant_ID, category, gallery_path } = req.body;
        const category_img = req.file ? `/images/food_img/${req.file.filename}` : gallery_path || null;

        // Validate that restaurant_ID and category are provided
        if (!restaurant_ID || !category) {
            return res.status(400).json({ message: "Restaurant ID and category are required." });
        }
        try {

            if (!gallery_path) {
                await insertPathImg(category_img);
            }

            // Check if the category already exists in the database
            const checkSql = `SELECT category FROM Categories WHERE category = ? AND restaurant_ID = ? LIMIT 1`;
            db.query(checkSql, [category, restaurant_ID], (error, results) => {
                if (error) {
                    console.error("Error fetching category:", error.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                // If the category already exists, return an error
                if (results.length > 0) {
                    return res.status(409).json({ message: `Category '${results[0].category}' already exists.` });
                }

                // Insert the new category into the database
                const sql = `INSERT INTO Categories (restaurant_ID,category,category_image) VALUES (?, ?, ?)`;
                db.query(sql, [restaurant_ID, category, category_img], (error, results) => {
                    if (error) {
                        console.error('Error inserting category:', error.message);
                        return errors.mapError(500, "Internal server error", next);
                    }

                    // Return success response with created category info
                    return res.status(200).json({
                        status: "200",
                        message: 'Category created successfully',
                        data: {
                            categoryID: results.insertId, // Include the new category ID
                            category: category,
                            category_img: category_img
                        }
                    });
                });
            });
        } catch (error) {
            console.error("Unexpected error:", error.message);
            return errors.mapError(500, "Internal server error", next);
        }
    });
};

exports.editCategory = (req, res, next) => {
    upload.single("category_img")(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(400).json({ message: err.message });
        }

        const { category_ID, category, update_at, gallery_path } = req.body;
        let category_img = req.file ? `/images/food_img/${req.file.filename}` : gallery_path || null;

        // Validate that category is provided
        if (!category) {
            return res.status(400).json({ message: "Category is required." });
        }
        try {
            // Handle case where category_img exists
            if (category_img != null) {
                if (!gallery_path) {
                    // If gallery_path is not provided, insert the category image path into the database
                    await insertPathImg(category_img);
                }

                const sql = `UPDATE Categories SET category=?, update_at=?, category_image=? WHERE category_ID=?`;
                db.query(sql, [category, update_at, category_img, category_ID], (error) => {
                    if (error) {
                        console.error('Error updating category:', error.message);
                        errors.mapError(500, "Internal server error", next);
                        return;
                    }
                    return res.status(200).json({
                        status: "200",
                        message: "Category updated successfully",
                    });
                });
            } else {
                // Handle case where category_img is not provided
                const sql = `UPDATE Categories SET category=?, update_at=? WHERE category_ID=?`;
                db.query(sql, [category, update_at, category_ID], (error) => {
                    if (error) {
                        console.error('Error updating category:', error.message);
                        errors.mapError(500, "Internal server error", next);
                        return;
                    }
                    return res.status(200).json({
                        status: "200",
                        message: "Category updated successfully",
                    });
                });
            }
        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next);
        }
    });
}


exports.editStatusCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { category_status, update_at } = body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Categories SET category_status=?,update_at=? WHERE category_ID =?`;
        db.query(sql, [category_status, update_at, id], (error, results) => {
            if (error) {
                console.error('Error update user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'category edit successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }

}

exports.deleteCategory = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Categories WHERE category_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting category:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'category not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'category deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}