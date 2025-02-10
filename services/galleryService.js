const errors = require('../utils/errors');
const db = require('../db/connection');

exports.getAllGallery = (req, res, next) => {
    const { page, limit } = req.query;
    const pageNumber = page ? Number(page) : 1;
    const pageLimit = limit ? Number(limit) : 100;
    const offset = (pageNumber - 1) * pageLimit;

    try {
        const sql = `SELECT * FROM PathImg LIMIT ? OFFSET ?`;

        db.query(sql, [pageLimit, offset], (error, results) => {
            if (error) {
                console.error("Error fetching path images:", error.message);
                return errors.mapError(500, "Internal server error", next);
            }

            const countSql = `SELECT COUNT(*) AS total FROM PathImg`;
            db.query(countSql, (countError, countResults) => {
                if (countError) {
                    console.error("Error counting path images:", countError.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                const totalRecords = countResults[0].total;
                return res.status(200).json({
                    status: "200",
                    message: "Get all path images successfully",
                    total_item: totalRecords,
                    data: results,
                });
            });
        });
    } catch (error) {
        console.error(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};
