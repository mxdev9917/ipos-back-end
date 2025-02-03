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


// exports.createProduct = (req, res, next) => {









// // const {category_ID, restaurant_ID, product_name, price , product_img}=req.body;

// // console.log(category_ID, restaurant_ID, product_name, price , product_img);


//     // Configure Multer for file upload
// //     const storage = multer.diskStorage({
// //         destination: './uploads/',
// //         filename: (req, file, cb) => {
// //             cb(null, Date.now() + path.extname(file.originalname));
// //         }
// //     });
// //     const upload = multer({ storage: storage });
// //     // Insert product API with image upload
// //     app.post('/products', upload.single('product_img'), (req, res) => {
// //         const { category_ID, restaurant_ID, product_name, price, product_status } = req.body;
// //         const product_img = req.file ? `/uploads/${req.file.filename}` : null;

// //         if (!category_ID || !restaurant_ID || !product_name || !price) {
// //             return res.status(400).json({ error: 'Required fields are missing' });
// //         }
// //         const sql = `INSERT INTO Products (category_ID, restaurant_ID, product_name, price, product_img)
// //         VALUES (?, ?, ?, ?, ?, ?)`;

// //         const values = [category_ID, restaurant_ID, product_name, price , product_img];
// //         db.query(sql, values, (err, result) => {
// //             if (err) {
// //                 console.error('Error inserting product:', err);
// //                 return res.status(500).json({ error: 'Database error' });
// //             }
// //             res.status(201).json({ message: 'Product added successfully', product_ID: result.insertId, product_img });
// //         });
// //     });
//  }
// exports.createProduct = (req, res, next) => {

//     let body = req.body;
//     console.log(body)
//     const { category_ID, restaurant_ID, product_name, price, product_img } = req.body;

//     // if (!category_ID || !restaurant_ID || !product_name || !price) {
//     //     return res.status(400).json({ message: "All required fields must be provided." });
//     // }

//     // try {
//     //     // Check if product name already exists for the same restaurant
//     //     const checkSql = `SELECT product_name FROM Products WHERE product_name = ? AND restaurant_ID = ?`;
//     //     db.query(checkSql, [product_name, restaurant_ID], (error, results) => {
//     //         if (error) {
//     //             console.error("Error fetching product:", error.message);
//     //             return errors.mapError(500, "Internal server error", next);
//     //         }
//     //         if (results.length > 0) {
//     //             return res.status(409).json({ message: `Product '${results[0].product_name}' already exists.` });
//     //         }

//     //         // Insert new product
//     //         const insertSql = `INSERT INTO Products (category_ID, restaurant_ID, product_name, price, product_img) VALUES (?, ?, ?, ?, ?)`;
//     //         db.query(insertSql, [category_ID, restaurant_ID, product_name, price, product_img || null], (error, results) => {
//     //             if (error) {
//     //                 console.error("Error inserting product:", error.message);
//     //                 return errors.mapError(500, "Internal server error", next);
//     //             }
//     //             return res.status(201).json({
//     //                 status: "201",
//     //                 message: "Product created successfully",
//     //                 data: { product_ID: results.insertId, category_ID, restaurant_ID, product_name, price, product_img },
//     //             });
//     //         });
//     //     });
//     // } catch (error) {
//     //     console.error("Unexpected error:", error.message);
//     //     errors.mapError(500, "Internal server error", next);
//     // }
// };
