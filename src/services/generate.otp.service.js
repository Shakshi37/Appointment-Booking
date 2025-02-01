const otpGenerator = require('otp-generator')
const logger = require('../utils/logger')
const utility_func= require('../utils/utility-function')

const generateOtp = () => {
    let func_name = 'generateOtp'
    logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets: false});
};

module.exports = { generateOtp: generateOtp }