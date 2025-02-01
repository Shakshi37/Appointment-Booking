const authManager = require('../models/controlcenter.user_auth_manager');
const userAuth = require('../models/controlcenter.user_auth');
const utility_func = require('../utils/utility-function');
const logger = require('../utils/logger');
const { generateOtp } = require('../services/generate.otp.service');
const { sendEmail } = require('../services/email.service.service')
const jwtAuth = require('../middleware/jwt-middleware');
const User = require('../models/controlcenter.users');
const { sendSms } = require('../services/sms.service');
const bcrypt = require('bcrypt');
const userRegistrationService = async (req, res) => {
    let func_name = 'userRegistrationService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const otp = generateOtp();
        const { identifier, user_name, user_category_code } = req.body;
        const isEmail = utility_func.checkIsEmail(identifier);

        const existingUser = await authManager.findOne({ identifier: identifier });

        if (existingUser && existingUser.is_verified == true) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_ALREADY_REGISTERED,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.CONFLICT, utility_func.httpStatusCode.StatusCodes.CONFLICT),
                true,
                null
            );
        }

        await upsertAuthManager(identifier, otp, req.headers[utility_func.jsonCons.FIELD_APPS_NAME], false);
        await upsertUser(identifier, user_name, user_category_code, null, req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);

        const jwtResponse = await jwtAuth.generateJwtToken(
            {
                [utility_func.jsonCons.FIELD_IDENTIFIER]: identifier,
                [utility_func.jsonCons.FIELD_OTP]: otp,
                [utility_func.jsonCons.FIELD_CREATED_DATE_TIME]: [utility_func.formatDate(new Date())]
            }, { [utility_func.jsonCons.FIELD_JWT_ID]: identifier, "issuer": req.headers[utility_func.jsonCons.FIELD_APPS_NAME] }
        );

        await upsertUserAuth(identifier, jwtResponse.token, jwtResponse.refresh_token, req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);

        res.header(utility_func.jsonCons.FIELD_TOKEN, jwtResponse.token);
        res.header(utility_func.jsonCons.FIELD_REFRESH_TOKEN, jwtResponse.refresh_token);

        if (isEmail) {
            await sendEmail(utility_func.inputCons.FIELD_DATA, otp);
        } else {
            await sendSms(identifier, otp);
        }
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_OTP_SENT_SUCCESSFULLY,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
            false,
            null
        );
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw err;
    }
};

const verifyOtpService = async (req, res) => {
    const func_name = 'verifyOtpService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const isLogin = req.body[utility_func.jsonCons.FIELD_IS_LOGIN] || false;
        const user = await authManager.findOne({
            identifier: req.body[utility_func.jsonCons.FIELD_IDENTIFIER],
            otp: req.body[utility_func.jsonCons.FIELD_OTP]
        });

        if (!user) {
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_INVALID_OTP,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
                true,
                null
            );
        }

        if (new Date(user.expires_at) < new Date()) {
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_OTP_EXPIRED,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
                true,
                null
            );
        }

        const tokenResp = await jwtAuth.verifyTokenAndRefreshToken(req.headers[utility_func.jsonCons.FIELD_TOKEN], req.body[utility_func.jsonCons.FIELD_IDENTIFIER], req.headers[utility_func.jsonCons.FIELD_APPS_NAME], false);
        const refreshTokenResp = await jwtAuth.verifyTokenAndRefreshToken(req.headers[utility_func.jsonCons.FIELD_REFRESH_TOKEN], req.body[utility_func.jsonCons.FIELD_IDENTIFIER], req.headers[utility_func.jsonCons.FIELD_APPS_NAME], true);
        const DBTokenResp = await jwtAuth.verifyTokenFromDB(req.body[utility_func.jsonCons.FIELD_IDENTIFIER], req.headers[utility_func.jsonCons.FIELD_APPS_NAME], req.headers[utility_func.jsonCons.FIELD_TOKEN], req.headers[utility_func.jsonCons.FIELD_REFRESH_TOKEN]);

        const isOtpMatching =
            tokenResp.otp === refreshTokenResp.otp &&
            tokenResp.otp === req.body[utility_func.jsonCons.FIELD_OTP];

        const isIdentifierMatching =
            tokenResp.identifier === refreshTokenResp.identifier &&
            tokenResp.identifier === req.body[utility_func.jsonCons.FIELD_IDENTIFIER];

        if (isOtpMatching && isIdentifierMatching && DBTokenResp) {

            if (isLogin && isLogin == true) {
                const jwtResponse = await jwtAuth.generateJwtToken(
                    {
                        [utility_func.jsonCons.FIELD_IDENTIFIER]: req.body[utility_func.jsonCons.FIELD_IDENTIFIER],
                        [utility_func.jsonCons.FIELD_APPS_NAME]: req.headers[utility_func.jsonCons.FIELD_APPS_NAME],
                        [utility_func.jsonCons.FIELD_CREATED_DATE_TIME]: [utility_func.formatDate(new Date())]
                    },
                    { [utility_func.jsonCons.FIELD_JWT_ID]: req.body[utility_func.jsonCons.FIELD_IDENTIFIER], "issuer": req.headers[utility_func.jsonCons.FIELD_APPS_NAME] }
                );
                await userAuth.updateMany(
                    { identifier: req.body[utility_func.jsonCons.FIELD_IDENTIFIER], apps_name: req.headers[utility_func.jsonCons.FIELD_APPS_NAME], is_active: true },
                    { is_active: false }
                );

                await upsertUserAuth(req.body[utility_func.jsonCons.FIELD_IDENTIFIER], jwtResponse.token, jwtResponse.refresh_token, req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);
                res.header(utility_func.jsonCons.FIELD_TOKEN, jwtResponse.token);
                res.header(utility_func.jsonCons.FIELD_REFRESH_TOKEN, jwtResponse.refresh_token);
            } else {
                await authManager.updateOne(
                    { identifier: req.body[utility_func.jsonCons.FIELD_IDENTIFIER] },
                    { is_verified: true, apps_name: req.headers[utility_func.jsonCons.FIELD_APPS_NAME], modifiedAt: utility_func.formatDate(new Date()), is_login: isLogin }
                );
            }

            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_OTP_VERIFIED_SUCCESSFULLY,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
                false,
                null
            )
        } else {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(utility_func.responseCons.RESP_INVALID_OTP, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED), true, null);
        }

    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_SOMETHING_WENT_WRONG,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, utility_func.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR),
            true,
            null
        );
    }
};

const userLoginService = async (req, res) => {
    const func_name = 'userLoginService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const { identifier, password } = req.body;
        const user = await authManager.findOne({ identifier: identifier, is_verified: true });

        if (!user) {
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_USER_NOT_REGISTERED,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.NOT_FOUND, utility_func.httpStatusCode.StatusCodes.NOT_FOUND),
                true,
                null
            );
        }
        if (req.query[utility_func.jsonCons.FIELD_IS_PASSWORD_LOGIN] == 'true') {

            const pass = await verifyPasswordService(identifier, password);
            await upsertAuthManager(identifier, null, req.headers[utility_func.jsonCons.FIELD_APPS_NAME], true);

            const jwtResponse = await jwtAuth.generateJwtToken(
                {
                    [utility_func.jsonCons.FIELD_IDENTIFIER]: identifier,
                    [utility_func.jsonCons.FIELD_USER_PASSWORD]: password,
                    [utility_func.jsonCons.FIELD_CREATED_DATE_TIME]: [utility_func.formatDate(new Date())]
                },
                { [utility_func.jsonCons.FIELD_JWT_ID]: identifier, "issuer": req.headers[utility_func.jsonCons.FIELD_APPS_NAME] }

            );

            await userAuth.updateMany(
                { identifier: req.body[utility_func.jsonCons.FIELD_IDENTIFIER], apps_name: req.headers[utility_func.jsonCons.FIELD_APPS_NAME], is_active: true },
                { is_active: false }
            );

            await upsertUserAuth(req.body[utility_func.jsonCons.FIELD_IDENTIFIER], jwtResponse.token, jwtResponse.refresh_token, req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);
            res.header(utility_func.jsonCons.FIELD_TOKEN, jwtResponse.token);
            res.header(utility_func.jsonCons.FIELD_REFRESH_TOKEN, jwtResponse.refresh_token);
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_LOGIN_SUCCESS_MSG,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
                false,
                null
            );
        } else {
            const otp = generateOtp();
            const isEmail = utility_func.checkIsEmail(identifier);
            await upsertAuthManager(identifier, otp, req.headers[utility_func.jsonCons.FIELD_APPS_NAME], true);
            const jwtResponse = await jwtAuth.generateJwtToken(
                {
                    [utility_func.jsonCons.FIELD_IDENTIFIER]: identifier,
                    [utility_func.jsonCons.FIELD_OTP]: otp,
                    [utility_func.jsonCons.FIELD_CREATED_DATE_TIME]: [utility_func.formatDate(new Date())]
                },
                { [utility_func.jsonCons.FIELD_JWT_ID]: identifier, "issuer": req.headers[utility_func.jsonCons.FIELD_APPS_NAME] }

            );
            await userAuth.updateMany(
                { identifier: req.body[utility_func.jsonCons.FIELD_IDENTIFIER], apps_name: req.headers[utility_func.jsonCons.FIELD_APPS_NAME], is_active: true },
                { is_active: false }
            );
            await upsertUserAuth(identifier, jwtResponse.token, jwtResponse.refresh_token, req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);

            if (isEmail) {
                await sendEmail(utility_func.inputCons.FIELD_DATA, otp);
            } else {
                await sendSms(identifier, otp);
            }

            res.header(utility_func.jsonCons.FIELD_TOKEN, jwtResponse.token);
            res.header(utility_func.jsonCons.FIELD_REFRESH_TOKEN, jwtResponse.refresh_token);
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_OTP_SENT_SUCCESSFULLY,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
                false,
                null
            );
        }

    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw err;
    }
};

const verifyPasswordService = async (identifier, password) => {
    const func_name = 'verifyPasswordService';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const user = await User.findOne({ identifier }).select('+password'); // Include password explicitly
        if (!user) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator(
                utility_func.responseCons.RESP_USER_NOT_FOUND,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.NOT_FOUND, utility_func.httpStatusCode.StatusCodes.NOT_FOUND),
                false,
                null
            );
        }
        // Validate the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw utility_func.responseGenerator(
                utility_func.responseCons.RESP_INVALID_PASSWORD,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
                false,
                null
            );

        }

        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_PASSWORD_VERIFY_MSG,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
            false,
            null
        );
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw utility_func.responseGenerator(
            utility_func.responseCons.RESP_INVALID_PASSWORD,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
            true,
            null
        );
    }
}

const setPasswordService = async (req, res) => {
    let func_name = 'setPasswordService';
    const { identifier, password } = req.body;
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    if (!identifier || !password) {
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_INVALID_PASSWORD,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
            false,
            null
        );
    }

    try {
        const user = await User.findOne({ identifier });
        if (!user) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_USER_NOT_FOUND,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.NOT_FOUND, utility_func.httpStatusCode.StatusCodes.NOT_FOUND),
                false,
                null
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const updatedUser = await User.findOneAndUpdate(
            { identifier: identifier },
            { password: hashedPassword, is_password_set: true },
            { new: true } // Return the updated document
        );
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_SUCCESS_MSG,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
            false,
            null
        );
    } catch (error) {
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw utility_func.responseGenerator(
            utility_func.responseCons.RESP_INTERNAL_SERVER_ERROR,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, utility_func.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR),
            false,
            null
        );
    }
}

const upsertAuthManager = async (identifier, otp, apps_name, is_login) => {
    let func_name = 'upsertAuthManager'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const user = await authManager.findOne({ identifier: identifier });

        if (user) {
            await authManager.updateOne({ identifier: identifier }, { otp: otp, modifiedAt: utility_func.formatDate(new Date()), expires_at: utility_func.formatDate(new Date().getTime() + 3 * 60 * 1000), apps_name: apps_name, is_login: is_login });
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        } else {
            const user = new authManager({ identifier: identifier, otp: otp, createdAt: utility_func.formatDate(new Date()), expires_at: utility_func.formatDate(new Date().getTime() + 3 * 60 * 1000), apps_name: apps_name, is_login: is_login });
            await user.save();
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        }
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw new Error(err.message);
    }
}

const upsertUserAuth = async (identifier, token, refresh_token, apps_name) => {
    let func_name = 'upsertUserAuth'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
    try {
        await userAuth.updateMany(
            { identifier: identifier, apps_name: apps_name, is_active: true },
            { is_active: false }
        );

        const user = new userAuth({
            identifier: identifier,
            token: token,
            refresh_token: refresh_token,
            apps_name: apps_name,
            is_active: true,
            expires_at: utility_func.formatDate(new Date().getTime() + 24 * 60 * 60 * 1000),
            createdAt: utility_func.formatDate(new Date())
        });
        await user.save();
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        throw new Error(err.message)
    }
}

const upsertUser = async (identifier, user_name, user_category_code, password, apps_name) => {
    const func_name = 'upsertUser';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);

    try {
        const existingUser = await User.findOne({ identifier });

        if (existingUser) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_USER_ALREADY_EXISTS,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.CONFLICT, utility_func.httpStatusCode.StatusCodes.CONFLICT),
                true,
                null
            );
        }
        const user = new User({
            identifier: identifier,
            user_name: user_name,
            password: password,
            user_category_code: user_category_code,
            apps_name: apps_name,
            createdAt: utility_func.formatDate(new Date())
        });
        await user.save();
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return utility_func.responseGenerator(
            utility_func.responseCons.RESP_SUCCESS_MSG,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
            true,
            null
        );
    } catch (err) {
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw utility_func.responseGenerator(
            utility_func.responseCons.RESP_INTERNAL_SERVER_ERROR,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, utility_func.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR),
            false,
            null
        );
    }
};

module.exports = { userRegistrationService: userRegistrationService, verifyOtpService: verifyOtpService, userLoginService: userLoginService, setPasswordService: setPasswordService };