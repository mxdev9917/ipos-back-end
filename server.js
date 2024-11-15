// const express = require('express')
// const Router=require('./router')
// const dotenv =require('dotenv')
// const errors = require('./utils/errors')
// const cors = require('cors');
// const allowedOrigins = ['http://localhost:5173'];
// dotenv.config({path:'./config.env'})
// const app = express();
// app.use(express.json()); 
// const port = process.env.PORT || 8080;

// app.use(express.static('./public/images')); // allows access to the picture in images in folder public
// app.use('/api/v1',Router);
// app.all("*",errors.pathError)
// app.use(errors.ApiError);

// app.options('*', cors());

// app.use(cors({
//     origin: allowedOrigins, // อนุญาตเฉพาะ origin ที่ระบุ
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'], // ระบุ HTTP methods ที่อนุญาต
//     allowedHeaders: ['Content-Type', 'Authorization'], // ระบุ headers ที่อนุญาต
//   }));





// app.listen(port, () => {
//     console.log(`server is running on port ${process.env.PORT}`);

// })

const express = require('express');
const Router = require('./router');  // Assuming router contains your API routes (like /signin)
const dotenv = require('dotenv');
const errors = require('./utils/errors');  // Custom error handling module
const cors = require('cors');

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();

// const allowedOrigins = ['http://localhost:5173'];  

const allowedOrigins = ['https://ipos-back-fu0t2zvbc-ehs-projects-72fd9887.vercel.app/?vercelToolbarCode=u_ZD4VWmXFF1ins'];  
const port = process.env.PORT || 8080;
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, 
    optionsSuccessStatus: 200  
}));
app.use(express.json());
app.use(express.static('./public/images'));
app.use('/api/v1', Router);
app.all('*', errors.pathError);
app.use(errors.ApiError);
app.options('*', cors());
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

