const express = require('express');
const Router = require('./router');
const dotenv = require('dotenv');
const errors = require('./utils/errors');
const cors = require('cors');
const path = require('path');

dotenv.config({ path: './config.env' });

const app = express(); // Define app before using it

const port = process.env.PORT || 8080;

// CORS middleware configuration
app.use(cors({
    origin: '*', // Allow all origins (for testing, restrict in production)
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Parse incoming JSON requests
app.use(express.json());

// Serve static files (images, etc.)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy!');
});

// Route handling
app.use('/', Router);

// Handle errors for unknown routes
app.all('*', errors.pathError);

// Global error handler
app.use(errors.ApiError);

// Preflight CORS handling
app.options('*', cors());

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
