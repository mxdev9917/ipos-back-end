const db = require('../db/connection');
const errors = require('../utils/errors')

exports.createOwner = (req, res,next) => {
   try {
    let body = req.body;
    const {
        owner_name,
        owner_email,
        owner_phone,
        owner_password,
        owner_img
    } = body;
    const query = 'INSERT INTO Owners (owner_name, owner_email, owner_phone,  owner_password, owner_img) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [owner_name, owner_email, owner_phone, owner_password, owner_img], (error, results) => {
        if (error) {
            console.error('Error inserting owner:', error.message);
            errors.mapError(error, 500, "Internal server error", next);
            return;
        }
        return res.status(200).json({ message: 'Owner created successfully', data: results });
    });
   } catch (error) {
    console.log(error.message);
    errors.mapError(error, 500, "Internal server error", next);
   }

}
exports.updateOwner = (req, res,next) => {
    try {
        let { id } = req.params;
    id = Number(id)
    const {
        owner_name,
        owner_email,
        owner_phone,
        owner_password,
        owner_img
    } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Owner ID is required' });
    }
    const query = `
        UPDATE Owners
        SET 
            owner_name = ?, 
            owner_email = ?, 
            owner_phone = ?, 
            owner_password = ?, 
            owner_img = ?
        WHERE owner_id = ?`;
    db.query(query, [owner_name, owner_email, owner_phone, owner_password, owner_img, id], (error, results) => {
        if (error) {
            console.error('Error updating owner:', error.message);
            errors.mapError(error, 500, "Internal server error", next);
            return;
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Owner not found' });
        }
        return res.status(200).json({ message: 'Owner updated successfully', data: results });
    });
    } catch (error) {
        console.log(error.message);
        errors.mapError(error, 500, "Internal server error", next);
    }
};
exports.getOwnerById = (req, res,next) => {
    try {
        let { id } = req.params;
    id = Number(id)
    const sql = 'SELECT * FROM Owners WHERE owner_id = ?';
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error fetching owners:', error.message);
            errors.mapError(error, 500, "Internal server error", next);
            return;
        }
        return res.status(200).json({ status: "200", message: 'success', data: results });
    });
    } catch (error) {
        console.log(error.message);
        errors.mapError(error, 500, "Internal server error", next);
    }
}
exports.getAllOwner = (req, res, next) => {
    try {
        const sql = 'SELECT * FROM Owners';
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching owners:', error.message);
                errors.mapError(error, 500, "Internal server error", next)
                return;
            }
            return res.status(200).json({ status: "200", message: 'success', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(error, 500, "Internal server error", next);
    }
}
exports.deleteOwnerById = (req, res,next) => {
    try {
        let { id } = req.params;
        id = Number(id); // Ensure the id is a number
        const sql = 'DELETE FROM Owners WHERE owner_id = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting owner:', error.message);
                errors.mapError(error, 500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Owner not found' });
            }
            return res.status(200).json({
                status: "200",
                message: 'Owner deleted successfully',
                data: results
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(error, 500, "Internal server error", next); 
    } 
};


