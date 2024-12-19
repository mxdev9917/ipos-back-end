const errors = require('../utils/errors')
const encrypt = require('../utils/encrypt');
const db = require('../db/connection');

exports.checkUser=(req,res,next)=>{
    let body =req.body;
    const user =body;
    console.log(user);
}

exports.createUser = async (req, res, next) => {
    try {
        let body = req.body;
        console.log(body)
        const { restaurant_ID, user_name, user, user_phone, user_password, user_role, user_img } = body;
        const sql = 'SELECT * FROM Users WHERE user = ?';
        db.query(sql, [user], async (error, results) => {
            if (error) {
                console.error('Error inserting user:', error.message);
                errors.mapError(500, "Internal server error", next);
                return;
            }
            if (results.length > 0) {
                return res.status(409).json({ message: `User is ${user} already used ` });
            }
            const sql = 'INSERT INTO Users(restaurant_ID,user_name,user,user_phone,user_password,user_role,user_img) VALUES(?,?,?,?,?,?,?)'
            db.query(sql, [restaurant_ID, user_name, user, user_phone, await encrypt.hashPassword(user_password), user_role, user_img], (error, results) => {
                if (error) {
                    console.error('Error inserting user:', error.message);
                    errors.mapError(500, "Internal server error", next);
                    return;
                }
                return res.status(200).json({status: "200", message: 'Users create successfully', data: results });
            })


        })
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);

    }
}

exports.deleteUser=(req,res,next)=>{
    return res.status(200).json({ message: 'Users create successfully'});
}

exports.signInUser=(req,res,next)=>{

}