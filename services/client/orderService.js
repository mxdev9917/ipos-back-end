const errors = require('../../utils/errors');
const db = require('../../db/connection');

exports.createMenuItem = (req, res, next) => {
   try {
      const {
         order_ID,
         food_ID,
         description,
         category_ID,
         quantity
      } = req.body;
      console.log({
         order_ID,
         food_ID,
         description,
         
         category_ID,
         quantity
      });







   } catch (err) {
      console.error("Error in createMenuItem:", err);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
   }
};



