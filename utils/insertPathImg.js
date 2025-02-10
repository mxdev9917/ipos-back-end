const db = require('../db/connection');

const insertPathImg = async (path) => {
    try {
        const sqlpath = `INSERT INTO PathImg (pathImg_name) VALUES (?)`;
        const [results] = await db.promise().query(sqlpath, [path]); // Use promise-based query
        return results; // Return results if needed
    } catch (error) {
        console.error("Error inserting path image:", error.message);
        throw new Error("Internal server error"); // Proper error handling
    }
};

module.exports = insertPathImg;
