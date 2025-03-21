const errors = require('../utils/errors')
const db = require('../db/connection');

exports.createOrder = (req, res, next) => {
    let body = req.body;
    const { table_ID, user_ID, table_status, restaurant_ID } = body;
    const currentDate = new Date();
    try {
        const sql = `INSERT INTO Orders (table_ID,user_ID,restaurant_ID, created_at) VALUES(?,?,?,?)`;
        db.query(sql, [table_ID, user_ID, restaurant_ID, currentDate], (error, results) => {
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
        return next(errors.mapError(400, "Request parameter invalid type"));
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Fix date format

    try {
        const order_status = "unpaid";
        const fetchOrderSQL = `SELECT order_ID FROM Orders WHERE table_ID = ? AND order_status = ?;`;

        db.query(fetchOrderSQL, [id, order_status], (error, results) => {
            if (error) {
                console.error('Error fetching order ID:', error.message);
                return next(errors.mapError(500, "Error fetching order ID"));
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const order_ID = results[0].order_ID;

            // Delete menu items first
            const deleteMenuItemsSQL = `DELETE FROM Menu_items WHERE order_ID = ?`;
            db.query(deleteMenuItemsSQL, [order_ID], (error) => {
                if (error) {
                    console.error('Error deleting menu items:', error.message);
                    return next(errors.mapError(500, "Error deleting menu items"));
                }

                // Now delete the order
                const deleteOrderSQL = `DELETE FROM Orders WHERE order_ID = ?`;
                db.query(deleteOrderSQL, [order_ID], (error) => {
                    if (error) {
                        console.error('Error deleting order:', error.message);
                        return next(errors.mapError(500, "Error deleting order"));
                    }

                    // Update table status
                    const updateTableSQL = `UPDATE Tables SET table_status = 'empty', update_at = ? WHERE table_ID = ?`;
                    db.query(updateTableSQL, [currentDate, id], (error) => { // Fixed order
                        if (error) {
                            console.error('Error updating table status:', error.message);
                            return next(errors.mapError(500, "Error updating table status"));
                        }

                        return res.status(200).json({ status: "200", message: "Successfully canceled order" });
                    });
                });
            });
        });

    } catch (error) {
        console.error(error.message);
        return next(errors.mapError(500, "Internal server error"));
    }
};

exports.createMenuItem = (req, res, next) => {
    const { table_ID, food_ID, quantity, description, category_ID } = req.body;
    try {
        // Fetch order ID first
        const currentDate = new Date();
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
                        insertMenuItem(orders_ID, food_ID, quantity, description, category_ID, res, next);
                    } else {
                        // Insert new menu item
                        insertMenuItem(orders_ID, food_ID, quantity, description, category_ID, res, next);
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
const insertMenuItem = (orders_ID, food_ID, quantity, description, category_ID, res, next) => {
    const currentDate = new Date();
    const insertSql = `INSERT INTO Menu_items (order_ID, food_ID, quantity, description,created_at,category_ID) VALUES (?,?, ?, ?, ?,?)`;
    db.query(insertSql, [orders_ID, food_ID, quantity, description, currentDate, category_ID], (insertError) => {
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
        const newOrderStatus = "unpaid"; // Order status to look for
        const sql = `
            SELECT O.order_ID, T.table_name
            FROM Orders O
            JOIN Tables T ON O.table_ID = T.table_ID
            WHERE O.table_ID = ? AND O.order_status = ?
        `;

        db.query(sql, [id, newOrderStatus], (error, results) => {
            if (error) {
                console.error("Error fetching order id:", error.message);
                return errors.mapError(500, "Error fetching order id", next);
            }

            if (results.length === 0) {
                return errors.mapError(404, "No unpaid orders found for the given table", next);
            }
            const { order_ID: newOrder_ID, table_name } = results[0];
            const menuSql = `
                SELECT F.food_ID, F.food_name, SUM(M.quantity) AS quantity, F.price,M.menu_item_status
                FROM Menu_items M
                LEFT JOIN Orders O ON M.order_ID = O.order_ID
                LEFT JOIN Foods F ON M.food_ID = F.food_ID
                WHERE O.order_ID = ?
                GROUP BY F.food_ID
            `;
            db.query(menuSql, [newOrder_ID], (error, menuResults) => {
                if (error) {
                    console.error("Error fetching menu item:", error.message);
                    return errors.mapError(500, "Error fetching menu item", next);
                }

                if (menuResults.length === 0) {
                    return errors.mapError(404, "No menu items found for this order", next);
                }

                // Calculate total price
                const totalPrice = menuResults.reduce((acc, item) => {
                    const price = item.price || 0;
                    const quantity = item.quantity || 0;
                    return acc + (price * quantity);
                }, 0);
                return res.status(200).json({
                    status: "200",
                    message: "Successfully fetched menu items and total quantity",
                    table_name: table_name,
                    totalPrice: totalPrice.toFixed(2), // Optional: Format totalPrice to two decimals
                    data: menuResults,
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

    const { food_ID, even } = req.body;
    const status = "unpaid";

    try {
        const sql = `
            SELECT mi.menu_items_ID, mi.quantity
            FROM Menu_items mi
            JOIN Orders O ON mi.order_ID = O.order_ID
            WHERE O.order_status = ?
            AND O.table_ID = ?
            AND mi.food_ID = ?
        `;

        db.query(sql, [status, id, food_ID], async (error, results) => {
            if (error) {
                console.error("Error fetching menu item for deletion:", error.message);
                return errors.mapError(500, "Error fetching menu item for deletion", next);
            }

            if (results.length === 0) {
                return errors.mapError(404, "No matching menu item found", next);
            }

            const menu_items_ID = results[0].menu_items_ID;
            const qty = Number(results[0].quantity);
            const newQty = qty - 1;

            try {
                if (even) {
                    for (const item of results) {
                        await deleteItem(item.menu_items_ID, next);
                    }
                } else {
                    if (newQty === 0) {
                        await deleteItem(menu_items_ID, next);
                    } else {
                        await updateQty(menu_items_ID, newQty, next);
                    }
                }

                return res.status(200).json({
                    status: "200",
                    message: "Menu item deleted successfully",
                });
            } catch (err) {
                console.error("Error processing deletion:", err.message);
                return errors.mapError(500, "Error processing deletion", next);
            }
        });
    } catch (error) {
        console.error("Internal server error:", error.message);
        return errors.mapError(500, "Internal server error", next);
    }
};

const updateQty = (menu_items_ID, qty, next) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Menu_items SET quantity = ? WHERE menu_items_ID = ?`;
        db.query(sql, [qty, menu_items_ID], (error) => {
            if (error) {
                console.error(error);
                return reject(new Error("Error updating quantity"));
            }
            resolve();
        });
    });
};

const deleteItem = (menu_items_ID, next) => {
    return new Promise((resolve, reject) => {
        const deleteSql = `
            DELETE FROM Menu_items
            WHERE menu_items_ID = ?
        `;
        db.query(deleteSql, [menu_items_ID], (deleteError) => {
            if (deleteError) {
                console.error("Error deleting menu item:", deleteError.message);
                return errors.mapError(500, "Error deleting menu item", next);
            }
            resolve();
        });
    });
};


exports.successOrder = async (req, res, next) => {
    const { table_ID, total_price } = req.body;
    const order_status = "paid";
    const table_status_empty = "empty";
    const currentDate = new Date();


    try {
        const sql = `UPDATE Orders SET total_price=?, order_status=?,updated_at=? WHERE table_ID=?`;
        await new Promise((resolve, reject) => {
            db.query(sql, [total_price, order_status, currentDate, table_ID], (error) => {
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
    const currentDate = new Date();
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Menu_items SET order_ID = ?,updated_at=? WHERE menu_items_ID = ?`;
        db.query(sql, [order_ID, currentDate, menu_items_ID], (error, results) => {
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
    const currentDate = new Date();
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Menu_items SET quantity=?,updated_at=? WHERE menu_items_ID = ?`;
        db.query(sql, [qty, currentDate, menu_items_ID], (error, results) => {
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
        const currentDate = new Date();
        const sql = `UPDATE Tables SET table_status=?,update_at=? WHERE table_ID=?`;
        db.query(sql, [table_status, currentDate, table_ID], (error) => {
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



