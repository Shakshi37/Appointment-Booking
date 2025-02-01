const mongoose = require('mongoose');
const handleMongoError = require('../middleware/errorHandler');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "AppointmentBooking",             
        });
        console.log('MongoDB connected...');
    } catch (err) {
        const errorDetails = handleMongoError(err);
        console.error(`Connection Error: ${errorDetails.message}`);
        return errorDetails
    }
};

module.exports = connectDB;
