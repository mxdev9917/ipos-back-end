const { log } = require('winston');
const db = require('../db/connection');  // Keep only one db import
const errors = require('../utils/errors');
const upload = require('../utils/multerConfigSlider');
const fs = require('fs');
const path = require('path');

exports.createslide = (req, res, next) => {
    upload.single("slider_url")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        const { restaurant_ID } = req.body;
        const slider_url = req.file ? `/images/slider_img/${req.file.filename}` : null;

        if (!restaurant_ID) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }
        try {
            const insertSql = `INSERT INTO Sliders (restaurant_ID,slider_url) VALUES (?, ?)`;
            db.query(insertSql, [restaurant_ID, slider_url], (error) => {
                if (error) {
                    console.error("Error inserting:", error.message);
                    return errors.mapError(500, "Internal server error", next);
                }

                return res.status(201).json({
                    status: "201",
                    message: "Slider created successfully",
                });
            });

        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next);
        }
    });
};

exports.getAllSlide = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);
    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }
    try {
        const sql = `SELECT slider_ID, slider_url, slider_visibility FROM Sliders WHERE restaurant_ID = ?`;
        db.query(sql, [id], (error, results) => {
            if (error) {
                console.log("Error fetching Sliders", error.message);
                return errors.mapError(500, "Error fetching Sliders", next);
            }
            res.status(200).json({ status: "200", message: "Fetching Sliders successfully", data: results });
        });

    } catch (error) {
        console.error("Unexpected error:", error.message);
        errors.mapError(500, "Internal server error", next);
    }
};




exports.editStatus = (req, res, next) => {
    const { slider_ID, slider_visibility } = req.body;
    try {
        const sql = `UPDATE Sliders SET slider_visibility = ? WHERE slider_ID = ?`;
        db.query(sql, [slider_visibility, slider_ID], (error) => {
            if (error) {
                console.log("Error updating Slider", error.message);
                return errors.mapError(500, "Error updating Slider", next);
            }
            res.status(200).json({ status: "200", message: "Editing Sliders successfully" });
        });
    } catch (error) {
        console.error("Unexpected error:", error.message);
        errors.mapError(500, "Internal server error", next);
    }
};


exports.deleteSlide = (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (Number.isNaN(id)) {
        return errors.mapError(400, "Request parameter invalid type", next);
    }

    const sqlFind = `SELECT slider_url FROM Sliders WHERE slider_ID = ?`;

    db.query(sqlFind, [id], (error, results) => {
        if (error) {
            console.error("Error fetching Sliders:", error.message);
            return errors.mapError(500, "Error fetching Sliders", next);
        }

        if (results.length === 0) {
            return errors.mapError(404, "Slider not found", next);
        }

        let imagePath = results[0].slider_url;

        // Ensure the correct absolute path to the image
        imagePath = path.join(__dirname, "..", "public", imagePath);

        console.log("Attempting to delete image at:", imagePath);  // Debugging log

        // Check if the file exists before trying to delete
        fs.access(imagePath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                console.warn("Image file not found, skipping deletion:", imagePath);
                return deleteRecord();  // Proceed with DB deletion even if file is missing
            }

            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting image file:", unlinkErr.message);
                    return errors.mapError(500, "Error deleting image file", next);
                }
                console.log("Image deleted successfully.");
                deleteRecord();
            });
        });

        function deleteRecord() {
            const sqlDelete = "DELETE FROM Sliders WHERE slider_ID = ?";
            db.query(sqlDelete, [id], (err) => {
                if (err) {
                    console.error("Database error while deleting record:", err.message);
                    return errors.mapError(500, "Database error while deleting record", next);
                }
                res.status(200).json({ status: "200", message: "DELETE Sliders successfully" });
            });
        }
    });
};



exports.editSlide = (req, res, next) => {
    upload.single("slider_url")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { slider_ID } = req.body; 
        console.log(slider_ID)
        const newSliderUrl = req.file ? `/images/slider_img/${req.file.filename}` : null;

        if (!slider_ID) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        try {
            const sqlFind = `SELECT slider_url FROM Sliders WHERE slider_ID = ?`;
            db.query(sqlFind, [slider_ID], (error, results) => {
                if (error) {
                    console.error("Error fetching Sliders:", error.message);
                    return errors.mapError(500, "Error fetching Sliders", next);
                }

                if (results.length === 0) {
                    return errors.mapError(404, "Slider not found", next);
                }

                // Build proper absolute image path
                const oldImagePath = path.join(__dirname, "..", "public", results[0].slider_url);

                fs.access(oldImagePath, fs.constants.F_OK, (accessErr) => {
                    if (accessErr) {
                        console.warn("Old image not found, skipping deletion.");
                        return updateRecord(slider_ID, newSliderUrl, res, next);
                    }

                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Error deleting old image:", unlinkErr.message);
                            return errors.mapError(500, "Error deleting old image", next);
                        }
                        console.log("Old image deleted successfully.");
                        return updateRecord(slider_ID, newSliderUrl, res, next);
                    });
                });
            });

        } catch (error) {
            console.error("Unexpected error:", error.message);
            errors.mapError(500, "Internal server error", next); 
        }
    });
};

function updateRecord(slider_ID, newSliderUrl, res, next) {
    const sqlUpdate = "UPDATE Sliders SET slider_url = ? WHERE slider_ID = ?";
    db.query(sqlUpdate, [newSliderUrl, slider_ID], (err) => {
        if (err) {
            console.error("Database error while updating slider:", err.message);
            return errors.mapError(500, "Database error while updating slider", next);
        }
        res.status(200).json({ status: "201", message: "Slider updated successfully" });
    });
}
