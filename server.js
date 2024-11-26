

const express = require('express');
const Router = require('./router'); 
const dotenv = require('dotenv');
const errors = require('./utils/errors');
const cors = require('cors');
dotenv.config({ path: './config.env' });

const app = express();

const allowedOrigins = ['http://localhost:5173'];  
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

app.use('/', Router); 

app.all('*', errors.pathError);

app.use(errors.ApiError);

app.options('*', cors());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

