const { userRegistrationService ,verifyOtpService,userLoginService,setPasswordService} = require('../services/auth.service');
const utility_func = require('../utils/utility-function')
const logger = require('../utils/logger')


const userRegistrationController = async (req, res) => {
    let func_name = 'userRegistrationController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await userRegistrationService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
};

const verifyOtpController = async (req, res) => {   
    let func_name = 'verifyOtpController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await verifyOtpService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}

const userLoginController = async (req, res) => {
    let func_name = 'userLoginController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await userLoginService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}

const setPasswordController = async (req, res) => {
    let func_name = 'setPasswordController' 
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
    try {
        const response = await setPasswordService(req,res);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(response[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(response);
    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_CONTROLLER + ' => ' + func_name);
        res.status(parseInt(error[utility_func.responseCons.RESP_CODE].replace(/\D/g, '')));
        res.send(error);
    }
}

module.exports = { userRegistrationController:userRegistrationController ,verifyOtpController:verifyOtpController,userLoginController:userLoginController,setPasswordController:setPasswordController};
