const errors = require('../utils/errors')
const db = require('../db/connection');

exports.creatOrder = (req, res, next) => {
    let body = req.body;
    const { table_ID, user_ID, table_status } = body
    try {
        const sql = `INSERT INTO Orders (table_ID, user_ID) VALUES(?,?)`;
        db.query(sql, [table_ID, user_ID], (error, results) => {
            if (error) {
                console.error('Error create oder:', error.message);
                errors.mapError(error, 500, "Error create oder", next)
                return;
            }
            const sql = `UPDATE Tables SET table_status=? WHERE table_ID=? `;
            db.query(sql, [table_status, table_ID], (error) => {
                if (error) {
                    console.error('Error update table status:', error.message);
                    errors.mapError(error, 500, "Error update table status", next)
                    return;
                }
            });
            return res.status(200).json({ status: "200", message: 'successfully' });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}

exports.canelOrder = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const order_status = "unpaid";
    const sql = `SELECT O.order_ID FROM Orders O LEFT JOIN Tables T ON O.table_ID = T.table_ID WHERE O.table_ID = ? AND O.order_status = ?;`
    db.query(sql, [id, order_status], (error, results) => {
        if (error) {
            console.error('Error fetching order id:', error.message);
            errors.mapError(error, 500, "Error fetching order id", next)
            return;
        }
        console.log(results);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'ID not found' });
        }else{
            const order_ID = results[0].order_ID;
            const deleteSql = `DELETE FROM Orders WHERE order_ID=? `;
            db.query(deleteSql, [order_ID], (error) => {
                if (error) {
                    console.error('Error delete order :', error.message);
                    errors.mapError(error, 500, "Error delete order", next)
                    return;
                }
            });
            const table_status = "empty"
            const updateTableSql = `UPDATE Tables SET table_status=? WHERE table_ID=?`;
            db.query(updateTableSql, [table_status, id], (error) => {
                if (error) {
                    console.error('Error update table status :', error.message);
                    errors.mapError(error, 500, "Error update table status", next)
                    return;
                }
            });
            return res.status(200).json({ status: "200", message: 'successfully' });
        }
       
    });

}