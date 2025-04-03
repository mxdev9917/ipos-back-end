const express = require('express');
const Router = require('./router');
const dotenv = require('dotenv');
const errors = require('./utils/errors');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

dotenv.config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 8080;

// Configure log rotation with monthly files and auto-delete after 3 months
const transport = new transports.DailyRotateFile({
    filename: 'logs/access-%Y-%m.log', // Creates logs like access-2025-04.log
    datePattern: 'YYYY-MM', // Rotates every month
    maxFiles: '3m', // Keeps logs for 3 months, then deletes old ones
    zippedArchive: true // Compresses old logs
});

// Setup Winston logger
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [transport, new transports.Console()] // Logs to file & console
});

// Use Winston with Morgan
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// CORS middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.get('/health', (req, res) => res.status(200).send('Server is healthy!'));
app.use('/', Router);

app.all('*', errors.pathError);
app.use(errors.ApiError);
app.options('*', cors());

app.listen(port, () => console.log(`Server running on port ${port}`));
