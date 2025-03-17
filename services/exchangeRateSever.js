const errors = require('../utils/errors')
const db = require('../db/connection');

exports.createRate = (req, res, next) => {
    const { restaurant_ID, currency, rate } = req.body;
    console.log({ restaurant_ID, currency, rate });
    try {
        const slq = `INSERT INTO Rates(restaurant_ID,currency,rate) VALUE(?,?,?)`
        db.query(slq, [restaurant_ID, currency, rate], (error) => {
            if (error) {
                console.error('Error crate rate:', error.message);
                errors.mapError(error, 500, "Error create rate", next)
                return;
            }
        });
        return res.status(200).json({
            status: "200", message: 'successfully'
        });
    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
}

exports.gatRate = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const offset = (pageNumber - 1) * pageLimit;
    try {
        const sql = `SELECT rate_ID,currency,rate,rate_status, DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at  FROM Rates WHERE restaurant_ID =?  LIMIT ? OFFSET ?`;
        db.query(sql, [id, pageLimit, offset], (error, results) => {

            if (error) {
                console.error('Error fatching rate:', error.message);
                errors.mapError(error, 500, "Error fetching rate", next)
                return;
            }
            const countSql = `SELECT COUNT(*) as total FROM Rates WHERE restaurant_ID = ?`;
            db.query(countSql, [id], (countError, countResults) => {
                if (countError) {
                    console.error('Error counting rate:', countError.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                const totalRecords = countResults[0].total;
                // const totalPages = Math.ceil(totalRecords / pageLimit);

                return res.status(200).json({
                    status: "200",
                    message: 'Get all rate successfully',
                    total_item: totalRecords,
                    data: results,

                });
            });
        });

    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }

}

exports.deleteRate = (req, res, next) => {

    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    try {
        const sql = `DELETE FROM Rates WHERE rate_ID =?`;
        db.query(sql, [id], (error) => {
            if (error) {
                console.error('Error delete rate:', countError.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200", message: 'successfully'
            });
        });
    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
}

exports.editStatusRate = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const { rate_status } = req.body;
    console.log(rate_status);


    try {
        const sql = `UPDATE Rates SET rate_status=? WHERE rate_ID=?`;
        db.query(sql, [rate_status, id], (error) => {
            if (error) {
                console.error('Error update rate:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200", message: 'successfully'
            });
        });
    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }

}

exports.editRate = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const { currency, rate } = req.body;
    console.log({ currency, rate });

    try {
        const sql = `UPDATE Rates SET currency=?,rate=? WHERE rate_ID=?`;
        db.query(sql, [currency, rate, id], (error) => {
            if (error) {
                console.error('Error update rate:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200", message: 'successfully'
            });
        });
    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }

}

exports.getRateByStatus = (req, res, next) => {
    let { id } = req.params; 
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    const status = "active"
    try {
        const sql = `SELECT rate_ID, currency,rate FROM Rates WHERE rate_status=? AND restaurant_ID = ? `
        db.query(sql,[status, id], (error, results) => {
            if (error) {
                console.error('Error fetching rate:', error.message);
                return errors.mapError(500, "Internal server error", next);
            }
            return res.status(200).json({
                status: "200", message: 'successfully', data: results
            });
        });

    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }

}

