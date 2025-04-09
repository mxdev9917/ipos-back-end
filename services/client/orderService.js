const errors = require('../../utils/errors');
const db = require('../../db/connection');
const { error, log } = require('winston');

exports.createMenuItem = (req, res, next) => {
   try {
      const {
         table_ID,
         food_ID,
         description,
         category_ID,
         quantity
      } = req.body;

      const cleanTableID = table_ID.replace(/"/g, '').trim();
      const checkOrderSql = `SELECT order_ID FROM Orders WHERE table_ID = ? AND order_status=?`;
      db.query(checkOrderSql, [cleanTableID, "unpaid"], (error, results) => {
         if (error) {
            console.error('Error checking order:', error.message);
            return res.status(500).json({
               status: "500",
               message: "Internal server error",
            });
         }

         if (results.length === 0) {
            return res.status(404).json({
               status: "404",
               message: "No unpaid order found for this table",
            });
         }
         const order_ID = results[0].order_ID;
         const sql = `INSERT INTO Menu_items(order_ID, food_ID, description, category_ID, quantity) VALUES(?, ?, ?, ?, ?)`;
         db.query(sql, [order_ID, food_ID, description, category_ID, quantity], (error, result) => {
            if (error) {
               console.error('Error inserting food item:', error.message);
               return res.status(500).json({
                  status: "500",
                  message: "Internal server error",
               });
            }

            return res.status(200).json({
               status: "200",
               message: "Food item inserted successfully",
               data: result
            });
         });
      });

   } catch (err) {
      console.error("Error in createMenuItem:", err);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
   }
};
exports.getOrder = (req, res, next) => {
   let { id } = req.params;
   id = Number(id);

   if (Number.isNaN(id)) {
      return errors.mapError(400, "Request parameter invalid type", next);
   }

   const sql = `SELECT order_ID, restaurant_ID FROM Orders WHERE table_ID = ? AND order_status = ?`;

   db.query(sql, [id, "unpaid"], async (error, results) => {
      if (error) {
         console.error('Error checking order:', error.message);
         return res.status(500).json({
            status: "500",
            message: "Internal server error",
         });
      }

      if (results.length === 0) {
         return res.status(404).json({
            status: "404",
            message: "No unpaid order found for this table",
         });
      }

      const { order_ID, restaurant_ID } = results[0];

      try {
         const [menuItems, rate] = await Promise.all([
            getMenuItem(order_ID),
            getRate(restaurant_ID),
         ]);

         return res.status(200).json({
            status: "200",
            message: "Order fetched successfully",
            data: {
               ...menuItems,
               rate,
            },
         });
      } catch (err) {
         console.error("Error fetching order details:", err.message);
         return res.status(500).json({
            status: "500",
            message: "Error fetching order details",
         });
      }
   });
};

const getMenuItem = (order_ID) => {
   return new Promise((resolve, reject) => {
      const sql = `
         SELECT F.food_ID, F.food_name, COALESCE(SUM(M.quantity), 0) AS quantity,
                F.price, M.menu_item_status
         FROM Menu_items M
         JOIN Orders O ON M.order_ID = O.order_ID
         JOIN Foods F ON M.food_ID = F.food_ID
         WHERE O.order_ID = ?
         GROUP BY F.food_ID, F.food_name, F.price, M.menu_item_status
      `;

      db.query(sql, [order_ID], (error, results) => {
         if (error) {
            console.error("Error fetching menu items:", error.message);
            return reject(new Error("Error fetching menu items"));
         }

         const totalPrice = results.reduce((sum, item) => {
            return sum + (item.price || 0) * item.quantity;
         }, 0);

         resolve({ menuItems: results, totalPrice });
      });
   });
};

const getRate = (restaurant_ID) => {
   return new Promise((resolve, reject) => {
      const sql = `SELECT rate_ID, currency, rate FROM Rates WHERE rate_status = ? AND restaurant_ID = ?`;

      db.query(sql, ["active", restaurant_ID], (error, results) => {
         if (error) {
            console.error("Error fetching rate:", error.message);
            return reject(new Error("Error fetching rate"));
         }
         resolve(results);
      });
   });
};

