const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');

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
        const sql = `SELECT category_ID, category,category_status, DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at  FROM Categories WHERE restaurant_ID = ? LIMIT ? OFFSET ?;`;
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
        const checkSql = `SELECT category_ID, category  FROM Categories WHERE  restaurant_ID = ? AND category_status =? `;
        db.query(checkSql, [id,status], (error, results) => {
            if (error) {
                console.error('Error fetching category:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length <= 0) {
                return res.status(409).json({ message: `Not found Category Id` });
            }
            return res.status(200).json({ status: "200", message: 'Category fetching successfullyccccccc', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }


}

exports.createCategory = (req, res, next) => {
    let body = req.body;
    const { restaurant_ID, category } = body;
    try {
        const checkSql = `SELECT category  FROM Categories WHERE category =? `;
        db.query(checkSql, [category], (error, results) => {
            if (error) {
                console.error('Error fetching category:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length > 0) {
                return res.status(409).json({ message: `Category is ${results[0].category} already used ` });
            }
            const sql = `INSERT INTO Categories(restaurant_ID,category) VALUES(?,?)`
            db.query(sql, [restaurant_ID, category], (error, results) => {
                if (error) {
                    console.error('Error inserting category:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                return res.status(200).json({ status: "200", message: 'Users create successfully', data: results });
            })
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }

}

exports.editCategory = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { category, update_at } = body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Categories SET category=?,update_at=? WHERE category_ID =?`;
        db.query(sql, [category, update_at, id], (error, results) => {
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