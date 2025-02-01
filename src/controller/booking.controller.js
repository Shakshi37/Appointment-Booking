const { UpsertSlotBookingService , updateBookingStatus,getUserBooking} = require('../services/booking.service');
const utility_func = require('../utils/utility-function')
const logger = require('../utils/logger')


const UpsertSlotBookingController = async (req, res) => {
    let func_name = 'UpsertSlotBookingController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await UpsertSlotBookingService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
};

const updateBookingStatusController = async (req, res) => {
    let func_name = 'updateBookingStatusController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await updateBookingStatus(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}


const getUserBookingController = async (req, res) => {
    let func_name = 'getUserBookingController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await getUserBooking(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}


module.exports={UpsertSlotBookingController,updateBookingStatusController,getUserBookingController}