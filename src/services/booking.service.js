const utility_func = require('../utils/utility-function');
const logger = require('../utils/logger');
const mongoose = require('mongoose')
const bookingSchema = require('../models/slot.slot_booking');
const SlotUpsert = require('../models/slot.slot_upsert');
const User = require('../models/controlcenter.users')
const { sendEmail } = require('../services/email.service.service')

async function UpsertSlotBookingService(req, res) {
    let func_name = 'UpsertSlotBookingService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const { expert_identifier, slot_id } = req.body;

        const user_id = await User.findOne({ identifier: req.sessionObject[utility_func.jsonCons.FIELD_IDENTIFIER] }, "_id");
        const expert_id = await User.findOne({ identifier: expert_identifier }, "_id");
        if (!user_id || !expert_id) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('User or Expert not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        const slot = await SlotUpsert.findById(slot_id);
        if (!slot) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Slot not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        if (slot.days.includes("Saturday") || slot.days.includes("Sunday")) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Bookings are not allowed on weekends', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        const bookingCount = await bookingSchema.countDocuments({ slot_id, status: "approved" });
        if (bookingCount >= slot.max_bookings) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Slot is fully booked', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        const booking = new bookingSchema({ user_id, expert_id, slot_id, status: "pending" });
        await booking.save();
        const data = {
            "MAIL_TO": expert_identifier,
            "MAIL_CC": [],
            "MAIL_BCC": [],
            "SUBJECT": "New Booking Request",
            "TEXT": `You have a new booking request from ${req.sessionObject[utility_func.jsonCons.FIELD_IDENTIFIER]}`,
            "HTML": `<b><p>Please Take Action for ${req.sessionObject[utility_func.jsonCons.FIELD_IDENTIFIER]} booking Request .</p>`,
        };
        await sendEmail(data, null)
        return utility_func.responseGenerator('Slot booked successfully, waiting for approval', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK), false);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw error;

    }

}

async function updateBookingStatus(req, res) {
    let func_name = 'updateBookingStatus';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const { booking_id, status } = req.body;
        const booking = await bookingSchema.findById(booking_id);
        if (!booking) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Booking not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);

        }
        const userIdString = booking.user_id;
        const userIdMatch = userIdString.match(/new ObjectId\('(.*)'\)/);
        let user;
        if (userIdMatch) {
            const userId = new mongoose.Types.ObjectId(userIdMatch[1]);
            user = await User.findById(userId);
        } else {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => Error: Invalid user_id format' + func_name);
        }
        if (!booking_id || !["approved", "canceled"].includes(status)) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator("Invalid booking_id or status", utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);

        }


        if (booking.status !== "pending") {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Only pending bookings can be updated', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);

        }
        if (status === "approved") {
            const slot = await SlotUpsert.findById(booking.slot_id);
            const bookingCount = await bookingSchema.countDocuments({ slot_id: booking.slot_id, status: "approved" });
            if (bookingCount >= slot.max_bookings) {
                logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
                throw utility_func.responseGenerator("Slot is fully booked", utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);

            }
        }
        booking.status = status;
        await booking.save();
        const data = {
            "MAIL_TO": user[utility_func.jsonCons.FIELD_IDENTIFIER],
            "MAIL_CC": [],
            "MAIL_BCC": [],
            "SUBJECT": `Your Booking has been ${status}`,
            "TEXT": ``,
            "HTML": `<b><p>Your appointment booking is now ${status}. .</p>`,
        };
        await sendEmail(data, null)
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator('Booking status updated', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK), false);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw error;
    }
}

async function getUserBooking(req, res) {
    let func_name = 'getUserBooking'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const userId = await User.findOne({ identifier: req.sessionObject[utility_func.jsonCons.FIELD_IDENTIFIER] }, "_id");
        if (!userId) {
            logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('User not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }
        const bookings = await bookingSchema.find({ user_id: userId })
            .populate("slot_id")
            .populate("expert_id")
            .exec();
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(utility_func.responseCons.RESP_SUCCESS_MSG, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK), false, bookings)
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw error;
    }
}

module.exports = {
    UpsertSlotBookingService: UpsertSlotBookingService, updateBookingStatus: updateBookingStatus,
    getUserBooking: getUserBooking
}