

exports.editSlide = (req, res, next) => {
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

