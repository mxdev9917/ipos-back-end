const db = require('../db/connection');
const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const { json } = require('body-parser');

exports.signInOwner = (req, res, next) => {
    try {
        let body = req.body;
        const { owner_email, owner_password } = body;
        const sql = 'SELECT * FROM Owners WHERE owner_email = ?';
        db.query(sql, [owner_email], (error, results) => {
            db.query(sql, [owner_email], async (error, results) => {
                if (error) {
                    console.error('Error fetching owners:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                if (results.length === 0) {
                    return errors.mapError(500, `not found is ${owner_email} `, next);
                } else {
                    const isPwdValid = await encrypt.comparePasswrod(owner_password, results[0].owner_password)
                    if (!isPwdValid) {
                        return errors.mapError(401, 'Password invlalid', next);
                    } else {
                        const isStatusValid = results[0].owner_status !== 'lock' || results[0].owner_status !== 'disable'
                        if (!isStatusValid) {
                            return errors.mapError(401, `this user is ${results[0].owner_status}`, next);
                        } else {
                            // create token
                            const token = await encrypt.generateJWT({ email: owner_email });
                            return res.status(200).json({ status: "200", message: 'success', token: token, data: results });
                        }
                    }
                }
            });
        });


    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal sever error', next);

    }


}

exports.createOwner = async (req, res, next) => {
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
        db.query(query, [owner_name, owner_email, owner_phone, await encrypt.hashPassword(owner_password), owner_img], (error, results) => {
            if (error) {
                console.error('Error inserting owner:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            return res.status(200).json({ message: 'Owner created successfully', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }

}
exports.updateOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id)
        const {
            owner_name,
            owner_email,
            owner_phone,
            owner_status,
            owner_password,
            owner_img
        } = req.body;

        const query = `
        UPDATE Owners
        SET 
            owner_name = ?, 
            owner_email = ?, 
            owner_phone = ?, 
            owner_status= ?,
            owner_password = ?, 
            owner_img = ?
        WHERE owner_id = ?`;
        db.query(query, [owner_name, owner_email, owner_phone, owner_status, await encrypt.hashPassword(owner_password), owner_img, id], (error, results) => {
            if (error) {
                console.error('Error updating owner:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Owner not found' });
            }
            return res.status(200).json({ message: 'Owner updated successfully', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};
exports.getOwnerById = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number

        // Check for invalid 'id' format
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Return 400 for invalid input
        }

        // Prepare the SQL query to get the owner (1 row) and all related restaurants
        const sql = `
            SELECT O.owner_name, O.owner_email, O.owner_phone, O.owner_status, O.owner_email, DATE_FORMAT(O.created_at, '%d-%m-%Y') AS owner_date,
                   R.restaurant_ID, R.restaurant_name, R.restaurant_status, R.restaurant_img, DATE_FORMAT(R.restaurant_expiry_date, '%d-%m-%Y') AS restaurant_Expiry_date, 
                   DATE_FORMAT(R.created_at, '%d-%m-%Y') AS restaurant_created_at, R.restaurant_expiry_date AS expiry_date
            FROM Owners O
            LEFT JOIN Restaurants R ON O.owner_ID = R.owner_ID
            WHERE O.owner_ID = ?;
        `;

        // Execute the query
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error fetching owners and restaurants:', error.message);
                return errors.mapError(500, "Internal server error", next);  // Proper error forwarding
            }

            // If no owner found with the given ID
            if (results.length === 0) {
                return res.status(404).json({ status: "404", message: "Owner not found" });
            }
            const ownerData = {
                owner_name: results[0].owner_name,
                owner_email: results[0].owner_email,
                owner_phone: results[0].owner_phone,
                owner_status: results[0].owner_status,
                owner_date: results[0].owner_date,
            };

            const now = new Date();
            const restaurants = results.map(row => {
                if (!row.restaurant_ID) return null;
                const expiryDate = new Date(row.expiry_date);
                const expiryStatus = expiryDate < now ? "Expired" : row.restaurant_status;
                return {
                    restaurant_ID: row.restaurant_ID,
                    restaurant_name: row.restaurant_name,
                    restaurant_status: expiryStatus,
                    restaurant_img: row.restaurant_img,
                    restaurant_expiry_date: row.restaurant_Expiry_date,
                    restaurant_created_at: row.restaurant_created_at
                };
            });

            if (results[0].restaurant_ID == undefined) { //owner is not restaurant yet
                return res.status(200).json({
                    status: "200",
                    message: "Success",
                    data: {
                        owner: ownerData,
                    },
                    restaurantsMessage: "restaurant not found",
                });
            }
            return res.status(200).json({
                status: "200",
                message: "Success",
                data: {
                    owner: ownerData,
                    restaurants: restaurants
                }
            });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
};

exports.getAllOwner = (req, res, next) => {
    try {
        const sql = `SELECT O.owner_ID,O.owner_name, O.owner_email, O.owner_phone,O.owner_status, O.owner_img, O.owner_email, DATE_FORMAT(O.created_at, '%d-%m-%Y') AS  created_at, COUNT(R.restaurant_ID) AS restaurant_count FROM Owners O LEFT JOIN Restaurants R ON O.owner_ID = R.owner_ID GROUP BY O.owner_ID , O.owner_name`;
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching owners:', error.message);
                errors.mapError(error, 500, "Error fetching owners", next)
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Owner not found' });
            }
            return res.status(200).json({ status: "200", message: 'success', data: results });
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}
exports.deleteOwnerById = (req, res, next) => {
    try {
        let { id } = req.params;
        id = Number(id);  // Convert the 'id' to a number
        if (Number.isNaN(id)) {
            return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
        }
        const sql = 'DELETE FROM Owners WHERE owner_id = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.error('Error deleting owner:', error.message);
                errors.mapError(500, "Internal server error", next);
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
        errors.mapError(500, "Internal server error", next);
    }
}
exports.lockOwner=(req,res,next)=>{
    try {
        const{id}=req.params;
        const body=req.body;
        console.log(body)
        const {owner_status}=body
       const sql=`UPDATE Owners SET owner_status=? WHERE owner_ID=?`
       db.query(sql,[owner_status,id],(error,results)=>{
        if(error){
            console.log('Error updating owner status');  
            return  errors.mapError(500, "Error updating owner status", next);
        }
        return res.status(200).json({
            status: "200",
            message: 'Owner status updated successfully',
            data: results})

       })
        
     
        
        
        
    } catch (error) {
        console.log(error.message);
        errors.mapError(500,"Internal server errer",next)
    }



}







exports.Ownertest = (req, res, next) => {
    return res.status(200).json({ message: 'ipos' });
};

