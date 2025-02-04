const errors = require('../utils/errors');
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');
const upload = require('../utils/multerConfig');

exports.getAllProduct = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }

    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;

    try {
        const sql = `SELECT p.product_ID, p.product_name, c.category, p.product_status, p.price, p.product_img, p.created_at
                    FROM Restaurants r
                    JOIN Categories c ON r.restaurant_ID = c.restaurant_ID
                    JOIN Products p ON c.category_ID = p.category_ID
                    WHERE r.restaurant_ID = ? LIMIT ? OFFSET ?;`;

        const offset = (pageNumber - 1) * pageLimit;

        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Products:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            const countSql = `SELECT COUNT(*) as total FROM Products p WHERE p.restaurant_ID = ?;`;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Products:', countError.message); // Corrected this
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Products successfully',
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

exports.getByIdProduct = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const sql = `
            SELECT p.product_name,p.price,c.category_ID, c.category ,p.product_img
            FROM Products p
            JOIN Categories c ON c.category_ID = p.category_ID
            WHERE p.product_ID = ?
        `;

        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error("Error fetching Products:", error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: "Product fetched successfully", data: results });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};


exports.createProduct = (req, res, next) => {
    upload.single("product_img")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { category_ID, restaurant_ID, product_name, price } = req.body;
        const product_img = req.file ? `/images/product_img/${req.file.filename}` : null; // ✅ Fixed path

        if (!category_ID || !restaurant_ID || !product_name || !price) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        try {
            const checkSql = `SELECT product_name FROM Products WHERE product_name = ? AND restaurant_ID = ?`;
            db.query(checkSql, [product_name, restaurant_ID], (error, results) => {
                if (error) {
                    console.error("Error fetching product:", error.message);
                    return errors.mapError(500, "Internal server error", next);
                }
                if (results.length > 0) {
                    return res.status(409).json({ message: `Product '${results[0].product_name}' already exists.` });
                }

                const insertSql = `INSERT INTO Products (category_ID, restaurant_ID, product_name, price, product_img) VALUES (?, ?, ?, ?, ?)`;
                db.query(insertSql, [category_ID, restaurant_ID, product_name, price, product_img], (error, results) => {
                    if (error) {
                        console.error("Error inserting product:", error.message);
                        return errors.mapError(500, "Internal server error", next);
                    }
                    return res.status(201).json({
                        status: "201",
                        message: "Product created successfully",
                        data: {
                            product_ID: results.insertId,
                            category_ID,
                            restaurant_ID,
                            product_name,
                            price,
                            product_img,
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


exports.editProduct = (req, res, next) => {
    upload.single("product_img")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { product_ID, category_ID, product_name, price } = req.body;
        const product_img = req.file ? `/images/product_img/${req.file.filename}` : null; // ✅ Fixed path
        try {
            
                if (product_img != null) {
                    const updateSql = `UPDATE Products 
                    SET category_ID = ?, 
                        product_name = ?, 
                        price = ?, 
                        product_img = ? 
                    WHERE product_ID = ?`;
                    db.query(updateSql, [category_ID, product_name, price, product_img, product_ID], (error, results) => {
                        if (error) {
                            console.error("Error updating product:", error.message);
                            return errors.mapError(500, "Internal server error", next);
                        }
                        return res.status(200).json({
                            status: "200",
                            message: "Product updated successfully",
                        });
                    });
                } else {
                    const updateSql = `UPDATE Products 
                    SET category_ID = ?, 
                        product_name = ?, 
                        price = ?
                    WHERE product_ID = ?`;
                    db.query(updateSql, [category_ID, product_name, price, product_ID], (error, results) => {
                        if (error) {
                            console.error("Error updating product:", error.message);
                            return errors.mapError(500, "Internal server error", next);
                        }
                        return res.status(200).json({
                            status: "200",
                            message: "Product updated successfully",
                           
                        });
                    });
                }




        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next);
        }
    });


};


exports.deleteProduct = (req, res, next) => {

    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Products WHERE product_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting Products:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Products not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'Products deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }


}

exports.editStatusProduct = (req, res, next) => {


    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { product_status, updated_at } = body;


    console.log({ product_status, updated_at });


    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Products SET product_status=?,updated_at=? WHERE product_ID =?`;
        db.query(sql, [product_status, updated_at, id], (error, results) => {
            if (error) {
                console.error('Error update Products:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'Products edit successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }

}

