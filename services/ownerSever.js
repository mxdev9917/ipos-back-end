const db = require('../db/connection');

exports.createOwner = (req, res) => {
    let body = req.body;
    const {
        owner_name,
        owner_email,
        owner_phone,
        // owner_status,
        owner_password,
        owner_img
    } = body;
    const query = 'INSERT INTO Owners (owner_name, owner_email, owner_phone,  owner_password, owner_img) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [owner_name, owner_email, owner_phone, owner_password, owner_img], (error, results) => {
        if (error) {
            console.error('Error inserting owner:', error.message);
            return res.status(500).json({ message: 'Error inserting owner' });
        }
        return res.status(200).json({ message: 'Owner created successfully', data: results });
    });

}
exports.updateOwner = (req, res) => {

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
            return res.status(500).json({ message: 'Error updating owner' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Owner not found' });
        }
        return res.status(200).json({ message: 'Owner updated successfully', data: results });
    });
};
exports.getOwnerById = (req, res) => {
    let { id } = req.params;
    id = Number(id)
    const sql = 'SELECT * FROM Owners WHERE owner_id = ?';
    db.query(sql,[id], (error, results) => {
        if (error) {
            console.error('Error fetching owners:', error.message);
            return;
        }
        return res.status(200).json({ status: "200", message: 'success', data: results });
    });
}
exports.getAllOwner = (req, res) => {
    const sql = 'SELECT * FROM Owners';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching owners:', error.message);
            return;
        }
        return res.status(200).json({ status: "200", message: 'success', data: results });
    });
}

exports.deleteOwnerById = (req, res) => {
    let { id } = req.params;
    id = Number(id); // Ensure the id is a number

    // SQL query to delete the owner with the given id
    const sql = 'DELETE FROM Owners WHERE owner_id = ?';

    // Execute the query to delete the owner
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error deleting owner:', error.message);
            return res.status(500).json({ message: 'Error deleting owner' });
        }

        // If no rows were affected, the owner was not found
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Successfully deleted the owner
        return res.status(200).json({
            status: "200",
            message: 'Owner deleted successfully',
            data: results
        });
    });
};


