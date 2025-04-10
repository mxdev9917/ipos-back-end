const errors = require('../utils/errors')
const db = require('../db/connection');
const { log } = require('winston');

const createNotification = async (restaurant_ID, table_ID, Notifications) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Notifications(restaurant_ID,table_ID,Notifications) VALUES(?,?,?)`;
        db.query(sql, [restaurant_ID, table_ID, Notifications], (error) => {
            if (error) {
                console.error("[timeTable] Error inserting notification :", error);
                return reject(new Error("Error inserting notification "));
            }
            resolve(results);
        })
    })
}

const editStatusNotification = (req, res, next) => {

}

exports.fetchNotification = (req, res, next) => {
    try {
        const {restaurant_ID,table_ID}=req.body;
        console.log({restaurant_ID,table_ID})

    } catch (error) {
 console.error("Unexpected error in get nitificatoin:", error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
}