const encrypt = require('../utils/encrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const errors = require('../utils/errors')
dotenv.config({ path: './config.env' });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: process.env.DB_CONNECTTIMEOUT, // 10 seconds
});

// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
// console.log('DB_DATABASE:', process.env.DB_DATABASE);

// Connect to the database
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to the database:', error.message);
        return;
    }
    console.log('Connected to the MySQL database');
    const userData = {
        name: process.env.NAME,
        email: process.env.EMAIL,
        phone: process.env.PHONE,
        role: 'superadmin',
        password: process.env.PASSWORD,
        status: 'active',
        img: '',

    };

    try {
        const checkQuery = 'SELECT COUNT(*) AS count FROM User_admins WHERE user_admin_email = ?';
        connection.query(checkQuery, [userData.email], async (error, results) => {
            if (error) {
                console.error('Error executing select query:', error.message);
                return;
            }
            const count = results[0].count;
            if (count === 0) {
                const insertQuery = `
                INSERT INTO User_admins (
                    user_admin_name, 
                    user_admin_email, 
                    user_admin_phone, 
                    user_admin_role, 
                    user_admin_password, 
                    user_admin_status, 
                    user_admin_img
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `;
                connection.query(insertQuery, [
                    userData.name,
                    userData.email,
                    userData.phone,
                    userData.role,
                    await encrypt.hashPassword(userData.password),
                    userData.status,
                    userData.img
                ], (error, results) => {
                    if (error) {
                        console.error('Error executing insert query:', error.message);
                        return;
                    }
                    console.log('User successfully inserted:', results.insertId);
                });
            }
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }





});

module.exports = connection;
