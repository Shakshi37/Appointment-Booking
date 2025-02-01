const utility_func = require('../utils/utility-function');
const logger = require('../utils/logger');
const moment = require('moment');
const SlotUpsert = require('../models/slot.slot_upsert');

function generateTimeSlots(startTime, endTime) {
    let func_name = 'generateTimeSlots';
logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    const slots = [];
    let currentTime = moment(startTime);

    while (currentTime.isBefore(endTime)) {
        const slotStart = currentTime.toDate();
        const slotEnd = moment(currentTime).add(30, 'minutes').toDate();

        if (slotEnd > endTime) break;

        slots.push({ startTime: slotStart, endTime: slotEnd });

        currentTime.add(30, 'minutes');
    }
    logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    return slots;
}


async function checkOverlap(identifier, newSlots) {
    let func_name = 'checkOverlap'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    const existingSlots = await SlotUpsert.find({ identifier });

    for (const slot of newSlots) {
        for (const existingSlot of existingSlots) {
            if (slot.startTime < existingSlot.endTime && slot.endTime > existingSlot.startTime) {
                return true; 
            }
        }
    }
    logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    return false;
}

async function UpsertSlotService(req, res) {
    let func_name = 'UpsertSlotService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const { identifier, timeRange, days, update = false } = req.body;
        const { startDate, endDate, startTime, endTime } = timeRange;

        if (!identifier || !startDate || !endDate || !startTime || !endTime || !days || days.length === 0) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Missing required fields', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        // Convert date and time to moment.js objects
        const parsedStartDate = moment(startDate, 'YYYY-MM-DD', true);
        const parsedEndDate = moment(endDate, 'YYYY-MM-DD', true);
        const parsedStartTime = moment(startTime, 'hh:mm:ss A', true);
        const parsedEndTime = moment(endTime, 'hh:mm:ss A', true);

        if (!parsedStartDate.isValid() || !parsedEndDate.isValid() || !parsedStartTime.isValid() || !parsedEndTime.isValid()) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Invalid date or time format', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        // Convert `days` from string format to numerical format (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayMapping = {
            "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
            "Thursday": 4, "Friday": 5, "Saturday": 6
        };

        const dayNumbers = days.map(day => dayMapping[day]);

        const newSlots = [];
        let currentDay = parsedStartDate.clone();

        // Loop through the date range from startDate to endDate
        while (currentDay.isSameOrBefore(parsedEndDate, 'day')) {
            if (dayNumbers.includes(currentDay.day())) {
                // Generate slots only for the selected days (Monday, Wednesday)
                const startOfDay = currentDay.clone().set({
                    hour: parsedStartTime.hours(),
                    minute: parsedStartTime.minutes(),
                    second: 0
                });

                const endOfDay = currentDay.clone().set({
                    hour: parsedEndTime.hours(),
                    minute: parsedEndTime.minutes(),
                    second: 0
                });

                // Generate 30-minute slots
                const slots = generateTimeSlots(startOfDay.toDate(), endOfDay.toDate(), startDate, endDate);
                newSlots.push(...slots);
            }
            // Move to the next day
            currentDay.add(1, 'day');
        }

        // Check for overlapping slots
        const overlap = await checkOverlap(identifier, newSlots);
        if (overlap) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Slots overlap with existing slots', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }

        // If update is true, delete existing slots before adding new ones
        if (update) {
            await SlotUpsert.deleteMany({
                identifier,
                startTime: { $gte: parsedStartDate.startOf('day').toDate() },
                endTime: { $lte: parsedEndDate.endOf('day').toDate() },
            });
        }

        // Insert the new slots
        for (const slot of newSlots) {
            const slotUpsert = new SlotUpsert({
                identifier,
                startTime: moment(slot.startTime).local().format('YYYY-MM-DD hh:mm:ss A'),
                endTime: moment(slot.endTime).local().format('YYYY-MM-DD hh:mm:ss A'),
                days,
            });
            await slotUpsert.save();
        }

        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_SUCCESS_MSG,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
            false,
            null
        );

    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw error;
    }
}

async function getSlotsService(req, res) {
    let func_name = 'getSlotsService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const { identifier } = req.body;  // Assuming identifier is sent in query params

        if (!identifier) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('Missing required fields', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null);
        }
        const slots = await SlotUpsert.find({ identifier });

        if (!slots.length) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator('No slots found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.NOT_FOUND, utility_func.httpStatusCode.StatusCodes.NOT_FOUND), true, null);
        }

        const formattedSlots = slots.map(slot => ({
            startTime: moment(slot.startTime).format('YYYY-MM-DD hh:mm:ss A'),
            endTime: moment(slot.endTime).format('YYYY-MM-DD hh:mm:ss A'),
            days: slot.days,
        }));

        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(utility_func.responseCons.RESP_SUCCESS_MESSAGE, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK), false, formattedSlots);

    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw error;
    }
}



module.exports = { UpsertSlotService,getSlotsService };