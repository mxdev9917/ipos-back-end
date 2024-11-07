const db = require('../db/connection');



exports.createOwner = (req, res) => {
    res.status(200).json({ status: "success", data: "update function" });

    // let body = req.body;
    // const {
    //     owner_name,
    //     owner_email,
    //     owner_phone,
    //     // owner_status,
    //     owner_password,
    //     owner_img
    // } = body;
    // const query = 'INSERT INTO Owners (owner_name, owner_email, owner_phone, owner_status, owner_password, owner_img) VALUES (?, ?, ?, ?, ?, ?)';
    // db.query(query, [owner_name, owner_email, owner_phone,, owner_password, owner_img], (error, results) => {
    //     if (error) {
    //         console.error('Error inserting owner:', error.message);
    //         return res.status(500).json({ message: 'Error inserting owner', error: error.message });
    //     }
    //     console.log('Owner inserted successfully:', results);
    //     return res.status(200).json({ message: 'Owner created successfully', data: results });
    // });

}
exports.getAllOwner = (req, res) => {
    const sql = 'SELECT * FROM Owners'; // Query to select all owners
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching owners:', error.message);
            return;
        }
        res.status(200).json({ status: "200", message: 'success', data: results });
    });
}
exports.updateOwner = (req, res) => {
    res.status(200).json({ status: "success", data: "update function" });
}
