const encrypt = require('../utils/encrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const errors = require('../utils/errors')
dotenv.config({ path: './config.env' });

const pool = mysql.createPool({
    connectionLimit: 10,  // Allows multiple concurrent queries
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: parseInt(process.env.DB_CONNECTTIMEOUT) || 10000,
    waitForConnections: true,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection error:', err.message);
        return;
    }
    console.log('Connected to MySQL database');

    try {
        const userData = {
            name: process.env.NAME,
            email: process.env.EMAIL,
            phone: process.env.PHONE,
            role: 'superadmin',
            password: process.env.PASSWORD,
            status: 'active',
            img: '',
        };

        const checkQuery = 'SELECT COUNT(*) AS count FROM User_admins WHERE user_admin_email = ?';

        connection.query(checkQuery, [userData.email], async (error, results) => {
            if (error) {
                console.error('Error executing select query:', error.message);
                connection.release();  // Release connection
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
                    } else {
                        console.log('User successfully inserted:', results.insertId);
                    }
                    connection.release();  // Release connection after query
                });
            } else {
                connection.release();  // Release connection if user already exists
            }
        });
    } catch (error) {
        console.log(error.message);
        errors.mapError(500, 'Internal server error', next);
    }
});

module.exports = pool;