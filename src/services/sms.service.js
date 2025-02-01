// const axios = require('axios');
const logger = require('../utils/logger')
const utility_func = require('../utils/utility-function')
const axios = require('axios')

const sendSms = function (phone_number, otp) {
    let func_name = 'sendSms'
    return new Promise((resolve, reject) => {
        logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        const headers = {
            "Content-Type": "application/json",
        }
        const url = `http://bulksms.smartsmssolution.in/api/sms/SendSMS.aspx?usr=srkexp&key=84B61C94-92A5-4E64-8F36-C9CFDD8D83D8&smstype=TextSMS&to=${phone_number}&msg=Your OTP for SRK'S HCIS login is ${otp}.&rout=Transactional&from=SRKEXP&templateid=1207166549138260220`;

        axios
            .post(url, { headers: headers })
            .then(function (response) {
                logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
                resolve(response)
            })
            .catch((error) => {
                logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
                reject(error)
            });
    });
}


module.exports = { sendSms: sendSms }
