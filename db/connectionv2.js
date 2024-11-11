const mysql = require('mysql2');
const dotenv =require('dotenv')
dotenv.config({ path: './config.env' });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout:process.env.DB_CONNECTTIMEOUT, // 10 seconds
   
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
// Connect to the database
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to the database:', error.message);
        return;
    }
    console.log('Connected to the MySQL database');

});


module.exports = connection;
