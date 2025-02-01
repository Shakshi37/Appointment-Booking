const { UpsertSlotService,getSlotsService} = require('../services/slot.service');
const utility_func = require('../utils/utility-function')
const logger = require('../utils/logger')


const UpsertSlotController = async (req, res) => {
    let func_name = 'UpsertSlotController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await UpsertSlotService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
};

const getSlotsController = async (req, res) => {
    let func_name = 'getSlotsController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await getSlotsService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}

module.exports = { UpsertSlotController,getSlotsController}
