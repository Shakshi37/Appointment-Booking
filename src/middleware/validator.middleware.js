const mongoose = require('mongoose');
const User = require('../models/controlcenter.users');
const UserCategory = require('../models/controlcenter.user_category');
const utility_func = require('../utils/utility-function')
const logger = require('../utils/logger')
const Joi = require('joi');

async function checkCategory(req, res, next, category) {
    let func_name = 'checkIfExpert'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    try {
        const identifier = req.sessionObject?.identifier;
        if (!identifier) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator('Missing required fields', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null));
        }

        const user = await User.findOne({ identifier });
        if (!user) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator('User not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null));
        }

        const userCategoryCode = user.user_category_code;

        const userCategory = await UserCategory.findOne({ user_category_code: userCategoryCode });
        if (!userCategory) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            throw res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator('User category not found', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true, null));
        }
        if ((category == utility_func.jsonCons.FIELD_CHECK_CATEGORY_EXPERT && userCategory.user_category_name === 'Expert') || (category == utility_func.jsonCons.FIELD_CHECK_CATEGORY_USER && userCategory.user_category_name === 'User')) {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return next();
        }
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        return res.status(utility_func.httpStatusCode.StatusCodes.FORBIDDEN).send(utility_func.responseGenerator('Access forbidden: Not an Valid Category', utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.FORBIDDEN, utility_func.httpStatusCode.StatusCodes.FORBIDDEN), true, null));

    } catch (error) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
        throw utility_func.responseGenerator(
            utility_func.responseCons.RESP_INTERNAL_SERVER_ERROR,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, utility_func.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR),
            false,
            null
        );
    }
}


function checkCategoryUser(req, res, next) {
    checkCategory(req, res, next, utility_func.jsonCons.FIELD_CHECK_CATEGORY_USER);
}
function checkCategoryExpert(req, res, next) {
    checkCategory(req, res, next, utility_func.jsonCons.FIELD_CHECK_CATEGORY_EXPERT);
}


const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const bodySchema = schema.body || Joi.object();
            const headerSchema = schema.headers || Joi.object();
            const querySchema = schema.query || Joi.object();
            const paramSchema = schema.params || Joi.object();

            const { error: bodyError } = bodySchema.validate(req.body);
            if (bodyError) return res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator(bodyError.details[0].message, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true))

            const { error: headerError } = headerSchema.validate(req.headers);
            if (headerError) return res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator(headerError.details[0].message, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true))
            const { error: queryError } = querySchema.validate(req.query);
            if (queryError) return res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator(queryError.details[0].message, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true))

            const { error: paramsError } = paramSchema.validate(req.params);
            if (paramsError) return res.status(utility_func.httpStatusCode.StatusCodes.BAD_REQUEST).send(utility_func.responseGenerator(paramsError.details[0].message, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.BAD_REQUEST, utility_func.httpStatusCode.StatusCodes.BAD_REQUEST), true))

            next();
        } catch (err) {
            logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return utility_func.responseGenerator(
                utility_func.responseCons.RESP_INTERNAL_SERVER_ERROR,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, utility_func.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR),
                false,
                null
            );
        }
    };
};



module.exports = { checkCategoryUser: checkCategoryUser, checkCategoryExpert: checkCategoryExpert, validateRequest: validateRequest };
