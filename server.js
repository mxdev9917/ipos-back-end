const express = require('express')
const Router=require('./router')
const dotenv =require('dotenv')
const errors = require('./utils/errors')
const allowedOrigins = ['http://localhost:5173'];
dotenv.config({path:'./config.env'})
const app = express();
app.use(express.json()); 
const port = process.env.PORT || 8080;

app.use(express.static('./public/images')); // allows access to the picture in images in folder public
app.use('/api/v1',Router);
app.all("*",errors.pathError)
app.use(errors.ApiError);








app.listen(port, () => {
    console.log(`server is running on port ${process.env.PORT}`);

})

// const express = require('express');
// const Router = require('./router');  // Assuming router contains your API routes (like /signin)
// const dotenv = require('dotenv');
// const errors = require('./utils/errors');  // Custom error handling module
// const cors = require('cors');

// // Load environment variables
// dotenv.config({ path: './config.env' });

// const app = express();

// // Allowed origins for CORS (React frontend is usually on localhost:5173 in development)
// const allowedOrigins = ['http://localhost:5173'];  

// // Set the port for the server
// const port = process.env.PORT || 8080;

// // Configure CORS middleware before any routes
// app.use(cors({
//     origin: allowedOrigins,  // Allow only specific origins
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'],  // Allowed HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
//     preflightContinue: false,  // Don't pass the preflight response to the next middleware
//     optionsSuccessStatus: 200  // For handling IE11's OPTIONS requests
// }));

// // Middleware for parsing JSON request bodies
// app.use(express.json());

// // Serve static files (images) from the public/images folder
// app.use(express.static('./public/images'));

// // Use the router for API routes
// app.use('/api/v1', Router);  // Router should contain routes like /signin

// // 404 Error handler for undefined routes
// app.all('*', errors.pathError);

// // Use your custom API error handler (for catching other errors)
// app.use(errors.ApiError);

// // Preflight CORS handling for OPTIONS requests
// app.options('*', cors());

// // Start the server on the defined port
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

