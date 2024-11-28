const express = require('express');
const Router = require('./router');
const dotenv = require('dotenv');
const errors = require('./utils/errors');
const cors = require('cors');
dotenv.config({ path: './config.env' });

const app = express();

// Add both development and production origins
const allowedOrigins = ['http://localhost:5173', 'https://ipos.la','https://admin.ipos.la','https://restaurant.ipos.la'];  
const port = process.env.PORT || 8080;

// CORS middleware configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests without an origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true, // Allow credentials (cookies, Authorization headers)
    preflightContinue: false, 
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Parse incoming JSON requests
app.use(express.json());

// Serve static files (images, etc.)
app.use(express.static('./public/images'));

// Route handling
app.use('/', Router);

// Handle errors for unknown routes
app.all('*', errors.pathError);

// Global error handler
app.use(errors.ApiError);

// Preflight CORS handling (this is usually required for browsers with complex requests)
app.options('*', cors());

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
