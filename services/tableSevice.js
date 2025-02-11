const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');

exports.getAlltable = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    try {

        const sql = `SELECT table_ID,table_name,table_status , DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at FROM Tables  WHERE restaurant_ID = ? LIMIT ? OFFSET ?;`;
        const offset = (pageNumber - 1) * pageLimit;
        db.query(sql, [id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching Tables:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            const countSql = `SELECT COUNT(*) as total FROM Tables WHERE restaurant_ID = ? `;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting Tables:', error.message);
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: 'Get all Tables successfully',
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

exports.getAllTableByStatus = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;

    try {
        const sql = `SELECT table_ID, table_name, table_status FROM Tables WHERE table_status != ? AND restaurant_ID = ? LIMIT ? OFFSET ?`;
        const offset = (pageNumber - 1) * pageLimit;

        db.query(sql, ["disable", id, pageLimit, offset], (error, results) => {
            if (error) {
                console.error('Error fetching tables:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            const countsql = `SELECT COUNT(*) as total FROM Tables WHERE restaurant_ID = ?`;
            db.query(countsql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting tables:', countError.message);
                    return errors.mapError(500, "Internal server error", next);
                }
                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: "Got all tables by status Active successfully",
                    total_item: totalRecords,
                    data: results
                });
            });
        });
    } catch (error) {
        console.log('Unexpected error:', error.message);
        errors.mapError(500, 'Internal server error', next);
    }
};


exports.deleteTable = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Tables WHERE table_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting Tables:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Tables not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'Tables deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }

}

exports.createTable = (req, res, next) => {
    let body = req.body;
    const { restaurant_ID, table_name } = body;
    try {
        const checkSql = `SELECT table_name  FROM Tables WHERE table_name =? `;
        db.query(checkSql, [table_name], (error, results) => {
            if (error) {
                console.error('Error fetching table:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length > 0) {
                return res.status(409).json({ message: `table is ${results[0].table_name} already used ` });
            }
            const sql = `INSERT INTO Tables(restaurant_ID,table_name) VALUES(?,?)`
            db.query(sql, [restaurant_ID, table_name], (error, results) => {
                if (error) {
                    console.error('Error inserting table:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                return res.status(200).json({ status: "200", message: 'table create successfully', data: results });
            })
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
}

exports.editTable = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { table_name, update_at } = body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Tables SET table_name=?,update_at=? WHERE table_ID =?`;
        db.query(sql, [table_name, update_at, id], (error, results) => {
            if (error) {
                console.error('Error update user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'Tables edit successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
}

exports.editStatusTable = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    let body = req.body;
    const { table_status, update_at } = body;
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        const sql = `UPDATE Tables SET table_status=?,update_at=? WHERE table_ID =?`;
        db.query(sql, [table_status, update_at, id], (error, results) => {
            if (error) {
                console.error('Error update Tables:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ status: "200", message: 'Tables edit successfully', data: results });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }

}

