const nodemailer = require('nodemailer');
const logger = require('../utils/logger')
const utility_func = require('../utils/utility-function');
const fs = require('fs');
const path = require('path');

const sendEmail = async (dataFromUser, otp) => {
    let func_name = 'sendEmail';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const templatePath = 'src/assests/otp-mail-template.html'; 
        let emailTemplate ;
        if (otp){
            emailTemplate =fs.readFileSync(templatePath, 'utf8') ;
            emailTemplate = emailTemplate.replace('{{otp}}', otp);
        }else{
            emailTemplate=dataFromUser.HTML
        }     
       

        var mailTransporter = nodemailer.createTransport({
            port: 587,
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            },
            secure: false,
            pool: true,
            maxConnections: 2,
            maxMessages: Infinity
        });

        var mailOptions = {
            from: {
                name: 'Appointment Booking',
                address: process.env.MAIL_USER
            },
            to: dataFromUser.MAIL_TO,
            cc: dataFromUser.MAIL_CC,
            bcc: dataFromUser.MAIL_BCC,
            subject: dataFromUser.SUBJECT,
            text: dataFromUser.TEXT,
            html: emailTemplate 
        };
        let data = await mailTransporter.sendMail(mailOptions);
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return data;
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw err;
    }
};


module.exports = { sendEmail: sendEmail }