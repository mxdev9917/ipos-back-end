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
                db.query(menuItemSql, [orders_ID, food_ID], async (menuError, menuResults) => {
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
                        await updateTableStatus(table_status, table_ID, next)
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
        await updateTableStatus(table_status_empty, table_ID, next);
        return res.status(200).json({ status: "200", message: 'Successfully Updated' });



    } catch (error) {
        console.error(error.message);
        return errors.mapError(error, 500, "Internal server error", next);
    }
};

exports.TableIncluded = async (req, res) => { // Removed 'next' from parameters
    const { table_ID, tableIncluded_ID } = req.body;
    try {
        const CurOrderID = await CurrentOrderID(parseInt(table_ID));
        const IncOrderID = await IncludedOrderID(parseInt(tableIncluded_ID));
        if (!CurOrderID || !IncOrderID) {
            return res.status(400).json({ error: "No orders found for the given table(s)." });
        }
        for (const curItem of CurOrderID) {
            let curFood_ID = curItem.food_ID;
            let curMenuTem_ID = curItem.menu_items_ID;
            let curQuantity = curItem.quantity;
            await Promise.all(IncOrderID.map(async (incIetem) => {
                let incFood_ID = incIetem.food_ID;
                let incOrder_ID = incIetem.order_ID;
                let incQuantity = incIetem.quantity;
                let incMenuTem_ID = incIetem.menu_items_ID;
                if (incFood_ID !== curFood_ID) {
                    await updateMenuItemOrderNotMatch(curMenuTem_ID, incOrder_ID);
                } else {
                    await updateMenuItemOrderMatch(incMenuTem_ID, incOrder_ID, curQuantity, incQuantity);
                }
            }));
        }

        // Uncomment if you need to update table status after processing
        await deleteMTCUR(CurOrderID[0].order_ID)
        await updateTableStatus("empty", table_ID);
        return res.status(200).json({
            status: "200",
            message: "Successfully updated table order",
        });
    } catch (error) {
        console.error("Error in TableIncluded:", error.message);
        return res.status(500).json({ error: error.message }); // Send the error response directly
    }
};

const deleteMTCUR = (CurOrderID) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Orders WHERE order_ID = ?`;
        db.query(sql, [CurOrderID], (error) => {
            if (error) {
                console.error("Error deleting order:", error);
                return reject(new Error("Error deleting order"));
            }
            resolve();
        });
    });
};


const updateMenuItemOrderNotMatch = (menu_items_ID, order_ID,) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Menu_items SET order_ID = ? WHERE menu_items_ID = ?`;
        db.query(sql, [order_ID, menu_items_ID], (error, results) => {
            if (error) {
                console.error(error);
                return reject(new Error("Error updating order ID"));
            }
            if (results.affectedRows === 0) {
                return reject(new Error("No rows updated. Please check the menu_items_ID."));
            }
            resolve();
        });
    });
};
const updateMenuItemOrderMatch = (menu_items_ID, order_ID, curQuantity, incQuantity) => {
    curQuantity = Number(curQuantity)
    incQuantity = Number(incQuantity)
    let qty = incQuantity + curQuantity;
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Menu_items SET quantity=? WHERE menu_items_ID = ?`;
        db.query(sql, [qty, menu_items_ID], (error, results) => {
            if (error) {
                console.error(error);
                return reject(new Error("Error updating order ID"));
            }
            if (results.affectedRows === 0) {
                return reject(new Error("No rows updated. Please check the menu_items_ID."));
            }
            resolve();
        });
    });
};



// Helper function to fetch orders by table
const fetchOrderByTable = async (tableID) => {
    return new Promise((resolve, reject) => {
        const order_status = "unpaid";
        const sql = `
            SELECT O.order_ID,M.food_ID,M.menu_items_ID, M.quantity 
            FROM Menu_items M 
            JOIN Orders O ON O.order_ID = M.order_ID
            WHERE O.table_ID = ? AND O.order_status = ?`;
        if (!tableID || typeof tableID !== 'number') {
            return reject(errors.mapError(new Error("Invalid tableID"), 400, "Invalid table ID"));
        }
        db.query(sql, [tableID, order_status], (error, results) => {
            if (error) {
                console.error("Error fetching order ID:", error.message);
                return reject(errors.mapError(error, 500, "Error fetching order ID"));
            }
            resolve(results.length > 0 ? results : null);
        });
    });
};

const IncludedOrderID = async (tableIncluded_ID) => {
    return fetchOrderByTable(tableIncluded_ID);
};
const CurrentOrderID = async (table_ID) => {
    return fetchOrderByTable(table_ID);
};
const updateTableStatus = async (table_status, table_ID) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Tables SET table_status=? WHERE table_ID=?`;
        db.query(sql, [table_status, table_ID], (error) => {
            if (error) {
                console.error("Error updating table status:", error.message);
                return reject(errors.mapError(error, 500, "Error updating table status"));
            }
            resolve();
        });
    });
};

const OrderItem = async (CurOrderID, table_ID) => {
    return new Promise((resolve, reject) => {
        const order_status = "unpaid";
        const sql = `
        SELECT M.*
        FROM Menu_items M 
        JOIN Orders O ON O.order_ID = M.order_ID
        WHERE O.order_ID = ? AND O.order_status = ? AND O.table_ID=?`;

        db.query(sql, [CurOrderID, order_status, table_ID], (error, results) => {
            if (error) {
                console.error("Error fetching order items:", error.message);
                return reject(errors.mapError(error, 500, "Error fetching order items"));
            }
            resolve(results.length > 0 ? results : []);
        });
    });
};



