const db = require('../db/connection');
const errors = require('../utils/errors');
const calculateDate = require('../utils/calculateDate')

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
    try {
        let body = req.body;
        let {
            owner_ID,
            restaurant_name,
            restaurant_img,
            qty,
            current_type
        } = body;
        console.log(body);

        qty = Number(qty);
        if (Number.isNaN(qty)) {

            return errors.mapError(400, "Invalid type. qty must be number only", next);
        }
        const expiryDate = calculateDate(qty, current_type);
        if (expiryDate == null) {
            return errors.mapError(400, "Invalid type. Use 'days', 'months', or 'years'.", next);
        }
        owner_ID = Number(owner_ID)
        if (Number.isNaN(owner_ID)) {

            return errors.mapError(400, "Invalid type. Owner must be number only", next);
        }

        const sql = `INSERT INTO Restaurants (owner_ID,  restaurant_name,  restaurant_img, restaurant_expiry_date)
                     VALUES(?,?,?,?)`;
        db.query(sql, [owner_ID, restaurant_name, restaurant_img, expiryDate],
            (error, results) => {
                if (error) {
                    console.error('Error create restaurant:', error.message);
                    return errors.mapError(500, `Internal server error`, next);
                }
                res.status(200).json({ message: "Restaurant created successfully.", data: results });
                return;
            });

    } catch (error) {
        console.log(error.Message);
        errors.mapError(500, `Internal server error`, next);
    }
}
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

        const sql = `UPDATE  Restaurants SET  restaurant_name=?,restaurant_status=?, restaurant_img=? WHERE restaurant_ID=?`;
        db.query(sql, [restaurant_name, restaurant_status,  restaurant_img, id],
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