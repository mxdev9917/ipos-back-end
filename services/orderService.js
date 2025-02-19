const errors = require('../utils/errors')
const db = require('../db/connection');

exports.creatOrder = (req, res, next) => {
    let body = req.body;
    const { table_ID, user_ID, table_status } = body
    try {
        const sql = `INSERT INTO Orders (table_ID, user_ID) VALUES(?,?)`;
        db.query(sql, [table_ID, user_ID], (error, results) => {
            if (error) {
                console.error('Error create oder:', error.message);
                errors.mapError(error, 500, "Error create oder", next)
                return;
            }
            const sql = `UPDATE Tables SET table_status=? WHERE table_ID=? `;
            db.query(sql, [table_status, table_ID], (error) => {
                if (error) {
                    console.error('Error update table status:', error.message);
                    errors.mapError(error, 500, "Error update table status", next)
                    return;
                }
            });
            return res.status(200).json({ status: "200", message: 'successfully' });
        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);
    }
}

exports.cancelOrder = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const order_status = "unpaid";
        const fetchOrderSQL = `SELECT order_ID FROM Orders WHERE table_ID = ? AND order_status = ?;`;

        db.query(fetchOrderSQL, [id, order_status], (error, results) => {
            if (error) {
                console.error('Error fetching order ID:', error.message);
                return next(errors.mapError(error, 500, "Error fetching order ID", next));
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const order_ID = results[0].order_ID;

            // Delete menu items first to avoid foreign key constraint
            const deleteMenuItemsSQL = `DELETE FROM Menu_items WHERE order_ID = ?`;
            db.query(deleteMenuItemsSQL, [order_ID], (error) => {
                if (error) {
                    console.error('Error deleting menu items:', error.message);
                    return next(errors.mapError(error, 500, "Error deleting menu items", next));
                }

                // Now delete the order
                const deleteOrderSQL = `DELETE FROM Orders WHERE order_ID = ?`;
                db.query(deleteOrderSQL, [order_ID], (error) => {
                    if (error) {
                        console.error('Error deleting order:', error.message);
                        return next(errors.mapError(error, 500, "Error deleting order", next));
                    }

                    // Update table status
                    const updateTableSQL = `UPDATE Tables SET table_status = 'empty' WHERE table_ID = ?`;
                    db.query(updateTableSQL, [id], (error) => {
                        if (error) {
                            console.error('Error updating table status:', error.message);
                            return next(errors.mapError(error, 500, "Error updating table status", next));
                        }

                        return res.status(200).json({ status: "200", message: "Successfully canceled order" });
                    });
                });
            });
        });

    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error", next));
    }
};

exports.createMenuItem = (req, res, next) => {
    const { table_ID, food_ID, quantity, description } = req.body;
    try {
        // Fetch order ID first
        const order_status = "unpaid"
        const orderSql = `SELECT * FROM Orders WHERE table_ID = ? AND order_status=?`;
        db.query(orderSql, [table_ID, order_status], (orderError, orderResults) => {
            if (orderError) {
                console.error('Error fetching order:', orderError.message);
                return errors.mapError(orderError, 500, "Error fetching order", next);
            }

            if (orderResults.length > 0) {
                const orders_ID = orderResults[0].order_ID; // Use correct assignment

                // Check if menu item exists for this order
                const menuItemSql = `SELECT * FROM Menu_items WHERE order_ID = ? AND food_ID = ?`;
                db.query(menuItemSql, [orders_ID, food_ID], (menuError, menuResults) => {
                    if (menuError) {
                        console.error('Error fetching menu item:', menuError.message);
                        return errors.mapError(menuError, 500, "Error fetching menu item", next);
                    }

                    if (menuResults.length > 0) {
                        let currentQty = Number(menuResults[0].quantity);
                        let newQty = currentQty + Number(quantity);
                        const updateSql = `UPDATE Menu_items SET quantity = ?, description = ? WHERE order_ID = ? AND food_ID = ?`;
                        db.query(updateSql, [newQty, description, orders_ID, food_ID], (updateError) => {
                            if (updateError) {
                                console.error('Error updating menu item:', updateError.message);
                                return errors.mapError(updateError, 500, "Error updating menu item", next);
                            }
                            return res.status(200).json({ status: "200", message: 'Successfully Updated' });
                        });
                    } else {
                        // Insert new menu item
                        insertMenuItem(orders_ID, food_ID, quantity, description, res, next);
                        const table_status = "busy";
                        updateTableStatus(table_status, table_ID, next)
                    }
                });
            } else {
                console.log("No order found for this table.");
                return res.status(404).json({ status: "404", message: "No order found" });
            }
        });
    } catch (error) {
        console.error(error.message);
        return errors.mapError(error, 500, "Internal server error", next);
    }
}
const insertMenuItem = (orders_ID, food_ID, quantity, description, res, next) => {
    const insertSql = `INSERT INTO Menu_items (order_ID, food_ID, quantity, description) VALUES (?, ?, ?, ?)`;
    db.query(insertSql, [orders_ID, food_ID, quantity, description], (insertError) => {
        if (insertError) {
            console.error('Error inserting menu item:', insertError.message);
            return errors.mapError(insertError, 500, "Error inserting menu item", next);
        }
        return res.status(200).json({ status: "200", message: 'Successfully inserted' });
    });
};

const updateTableStatus = (table_status, table_ID, next) => {
    const sql = `UPDATE Tables SET table_status=? WHERE table_ID =?`;
    db.query(sql, [table_status, table_ID], (error) => {
        if (error) {
            console.error('Error update Tables:', error.message);
            errors.mapError(500, "Internal server error", next);
            return;
        }
    });
}
exports.getMenuItem = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    try {
        const newOrderStatus = "unpaid"
        const sql = `SELECT order_ID FROM Orders WHERE table_ID=? AND order_status=?  `
        db.query(sql, [id, newOrderStatus], (error, results) => {
            if (error) {
                console.error("Error fetching order id:", error.message);
                return errors.mapError(error, 500, "Error fetching order id", next);
            }
            const newOrder_ID = results[0].order_ID
            const sql = `
            SELECT M.menu_items_ID, F.food_name, F.price, M.quantity
            FROM Menu_items M
            LEFT JOIN Orders O ON M.order_ID = O.order_ID
            LEFT JOIN Foods F ON M.food_ID = F.food_ID
            WHERE O.order_ID = ?`;

            db.query(sql, [newOrder_ID], (error, results) => {
                if (error) {
                    console.error("Error fetching menu item:", error.message);
                    return errors.mapError(error, 500, "Error fetching menu item", next);
                }

                // Ensure all prices are numbers and handle NULL values
                const totalPrice = results.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

                return res.status(200).json({
                    status: "200",
                    message: "Successfully fetched menu items and total quantity",
                    totalPrice: totalPrice,
                    data: results,
                });
            });


        });






    } catch (error) {
        console.error(error.message);
        return errors.mapError(500, "Internal server error", next);
    }
};

exports.deleteMenuItem = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    try {
        const sql = `DELETE FROM Menu_items WHERE menu_items_ID=? `
        db.query(sql, [id], (error) => {
            if (error) {
                console.error("Error deleting menu item:", error.message);
                return errors.mapError(error, 500, "Error deleting menu item", next);
            }
            return res.status(200).json({
                status: "200",
                message: "Successfully deleted menu items",
            });

        });

    } catch (error) {
        console.log(error.message);
        errors.mapError(500, "Internal server error", next);

    }
}

exports.successOrder = async (req, res, next) => {
    const { table_ID, total_price } = req.body;
    const order_status = "paid";
    const table_status_empty = "empty";

    try {
        const sql = `UPDATE Orders SET total_price=?, order_status=? WHERE table_ID=?`;
        await new Promise((resolve, reject) => {
            db.query(sql, [total_price, order_status, table_ID], (error) => {
                if (error) {
                    console.error('Error updating order status:', error.message);
                    return reject(errors.mapError(error, 500, "Error updating order status", next));
                }
                resolve();
            });
        });

        // Set table to empty after successful order update
        updateTableStatus(table_status_empty, table_ID, next);

        return res.status(200).json({ status: "200", message: 'Successfully Updated' });

    } catch (error) {
        console.error(error.message);
        return errors.mapError(error, 500, "Internal server error", next);
    }
};



