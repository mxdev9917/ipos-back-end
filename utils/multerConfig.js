const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the upload directory
const uploadDir = path.join(__dirname, "..", "public", "images", "food_img");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // ✅ Correct absolute path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                    allowedTypes.test(file.mimetype);
    isValid ? cb(null, true) : cb(new Error("Only .jpeg, .jpg, or .png files are allowed!"));
};

// Multer configuration
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter,
});

module.exports = upload;
