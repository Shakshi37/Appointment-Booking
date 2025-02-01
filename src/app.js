const express = require('express');
const authRoute = require('./routes/auth.route');
const slotRoute= require('./routes/slot.route');
const bookingRoute= require('./routes/booking.route');
const handleError=require('./middleware/errorHandler');
const app = express();

// Middleware
const whitelist = [process.env.ALLOWED_ORIGIN.split(',')].flat()

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin == undefined) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy error: Access denied for origin ${origin}`));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.json({ limit: '10mb' }));

// Error handling middleware
app.use((err, req, res, next) => {
    handleError(err, res);
});

// Routes
app.use('/auth', authRoute);
app.use('/slot', slotRoute);
app.use('/booking', bookingRoute);

module.exports = app;
