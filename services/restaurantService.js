const db = require('../db/connection');
const errors = require('../utils/errors');
const calculateDate = require('../utils/calculateDate')

// {
//     "owner_ID": "17",
//     "restaurant_name": "test",
//     "restaurant_img": "test.jpg",
//     "qty": 1,
//     "current_type": "years"

// }

// exports.signInRes = (req, res, next) => {
//     try {
//         let body = req.body;
//         const {
//             restaurant_user,
//             restaurant_password,
//         } = body;
//         const sql = 'SELECT * FROM Restaurants WHERE restaurant_user = ?';
//         db.query(sql, [restaurant_user], async (error, results) => {
//             if (error) {
//                 console.error('Error fetching use admin by id', error.message);
//                 return errors.mapError(404, `not found user : ${restaurant_user}`, next);
//             }
//             if (results.length === 0) {
//                 return errors.mapError(404, `not found user : ${restaurant_user}`, next);
//             } else {
//                 const isPwdValid = await encrypt.comparePasswrod(restaurant_password, results[0].restaurant_password)
//                 if (!isPwdValid) {
//                     return errors.mapError(401, `Password invlalid`, next);
//                 } else {
//                     const isStatusValid = results[0].restaurant_status === 'lock' || results[0].restaurant_status === 'disable';
//                     if (isStatusValid) {
//                         return errors.mapError(401, `this user is ${results[0].restaurant_status}`, next);
//                     } else {
//                         // create token
//                         let token = await encrypt.generateJWT({ user: restaurant_user });
//                         res.status(200).json({ status: "200", message: 'success', token: token, data: results });
//                     }
//                 }
//             }
//         });
//     } catch (error) {
//         console.log(error.Message);
//         errors.mapError(500, 'Internal server error', next);
//     }
// };
exports.createRas = async (req, res, next) => {
    let body = req.body;
    console.log(body)
    try {
        const { owner_ID, restaurant_name, restaurant_img, qty, current_type } = req.body;
        // Validate qty
        const quantity = Number(qty);
        if (Number.isNaN(quantity)) {
            return errors.mapError(400, "Invalid type. qty must be a number.", next);
        }

        // Validate owner_ID
        const ownerId = Number(owner_ID);
        if (Number.isNaN(ownerId)) {
            return errors.mapError(400, "Invalid type. Owner ID must be a number.", next);
        }

        // Validate expiry date
        const expiryDate = calculateDate(quantity, current_type);
        if (!expiryDate) {
            return errors.mapError(400, "Invalid type. Use 'days', 'months', or 'years' for current_type.", next);
        }

        // Validate restaurant name
        if (!restaurant_name || typeof restaurant_name !== "string") {
            return errors.mapError(400, "Restaurant name is required and must be a string.", next);
        }
        const sql = `INSERT INTO Restaurants (owner_ID, restaurant_name, restaurant_img, restaurant_expiry_date)
                     VALUES (?, ?, ?, ?)`;
        db.query(sql, [ownerId, restaurant_name, restaurant_img, expiryDate], (error) => {
            if (error) {
                console.error('Database error:', error.message);
                return errors.mapError(500, "Internal server error. Could not create restaurant.", next);
            }
            const sql = `
            SELECT O.owner_ID, O.owner_name, O.owner_email, O.owner_phone, O.owner_status, O.owner_email,O.owner_password, DATE_FORMAT(O.created_at, '%d-%m-%Y') AS owner_date,
                   R.restaurant_ID, R.restaurant_name, R.restaurant_status, R.restaurant_img, DATE_FORMAT(R.restaurant_expiry_date, '%d-%m-%Y') AS restaurant_Expiry_date, 
                   DATE_FORMAT(R.created_at, '%d-%m-%Y') AS restaurant_created_at, R.restaurant_expiry_date AS expiry_date
            FROM Owners O
            LEFT JOIN Restaurants R ON O.owner_ID = R.owner_ID
            WHERE  R.owner_ID = ?;`;
            db.query(sql, [owner_ID], async (error, results) => {
                if (error) {
                    console.error('Error fetching owner:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                const ownerData = {
                    owner_id: results[0].owner_ID,
                    owner_name: results[0].owner_name,
                    owner_email: results[0].owner_email,
                    owner_phone: results[0].owner_phone,
                    owner_status: results[0].owner_status,
                    owner_date: results[0].owner_date,
                };
                const now = new Date();
                const restaurants = results.map(row => {
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
                return res.status(200).json({
                    status: "200",
                    message: "Restaurant created successfully.",
                    data: {
                        owner: ownerData,
                        restaurants: restaurants
                    }
                });
            })
        });
    } catch (error) {
        console.error("Unexpected error:", error.message);
        errors.mapError(500, "Internal server error", next);
    }
};

exports.updateRes = async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);  // Convert id to a number
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Return a 400 for invalid ID
    }
    try {
        let body = req.body;
        let {
            restaurant_name,
            restaurant_status,
            restaurant_img,
        } = body;
        const now = new Date();
        const sql = `UPDATE  Restaurants SET  restaurant_name=?,restaurant_status=?, restaurant_img=?, update_at=? WHERE restaurant_ID=?`;
        db.query(sql, [restaurant_name, restaurant_status, restaurant_img, now, id],
            (error, results) => {
                if (error) {
                    console.error('Error updating restaurant:', error.message);
                    return errors.mapError(500, `Error updating restaurant`, next);
                }
                res.status(200).json({ message: "Restaurant updating  successfully.", data: results });
                return;
            });


    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, `Internal server error`, next);


    }

}
exports.getAllRes = (req, res, next) => {
    try {
        const sql = 'SELECT * FROM Restaurants ';
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching User admins error', error.message);
                errors.mapError(500, 'Internal server error', next);
                return;
            }
            if (results.affectedRows === 0) {
                errors.mapError(404, "No data in database", next);
            }
            res.status(200).json({ message: "successfully.", data: results });
            return;
        });
    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, 'Internal server error', next);
    }

}

exports.deleteRes = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);  // Change 404 to 400 for invalid input
    }
    const sql = 'DELETE FROM Restaurants WHERE restaurant_ID = ?'
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.log("Error deleting estaurants", error.message);
            return errors.mapError(500, 'Error deleting estaurants', next);
        }
        res.status(200).json({ status: "200", message: "user admin deleted successfuly", data: results });
    });




}