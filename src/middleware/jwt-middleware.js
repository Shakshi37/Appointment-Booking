const jwt = require('jsonwebtoken');
const utility_func = require('../utils/utility-function');
const fs = require('fs');
const logger = require('../utils/logger');
const path = require('path');
const authManager = require('../models/controlcenter.user_auth_manager');
const userAuth = require('../models/controlcenter.user_auth');
module.exports = {
    generateJwtToken: generateJwtToken,
    generateJwtRefreshToken: generateJwtRefreshToken,
    verifyTokenAndRefreshToken: verifyTokenAndRefreshToken,
    verifyTokenFromDB: verifyTokenFromDB,
    verifyUserAuth: verifyUserAuth,
    verifyJwtToken: verifyJwtToken,
    verifyJwtTokentoNext: verifyJwtTokentoNext,
    verifyJwtTokentoResponse: verifyJwtTokentoResponse
}

const options = { algorithm: process.env.TOKEN_ALGORITHM, expiresIn: process.env.TOKEN_LIFESPAN };
const refresh_options = { algorithm: process.env.TOKEN_ALGORITHM, expiresIn: process.env.REFRESH_TOKEN_LIFESPAN };

let privateKEY = fs.readFileSync(path.join(__dirname, '../config/private.key'), 'utf8');
let publicKEY = fs.readFileSync(path.join(__dirname, '../config/public.key'), 'utf8');

async function generateJwtToken(paramHash, signOptions) {
    let func_name = 'generateJwtToken';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    const jwtSignOptions = Object.assign({}, signOptions, options);

    logger.info(utility_func.logsCons.LOG_PARAM + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' paramHash => ' + JSON.stringify(paramHash) + ' jwtSignOptions => ' + JSON.stringify(jwtSignOptions));
    try {
        const jwtResp = await jwt.sign(paramHash, privateKEY, jwtSignOptions);
        const refreshToken = await generateJwtRefreshToken(jwtResp, signOptions);
        const token = {
            token: jwtResp,
            refresh_token: refreshToken
        };
        logger.info(utility_func.logsCons.LOG_PARAM + '=>' + utility_func.logsCons.LOG_SERVICE + '=>' + func_name);
        return token;
    } catch (jwtError) {
        logger.error(utility_func.logsCons.LOG_EXIT + '=>' + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' jwtError => ' + JSON.stringify(jwtError));
        let errorMsg = (jwtError.name == utility_func.jsonCons.FIELD_JSON_WEB_TOKEN_ERROR ? utility_func.responseCons.RESP_UNAUTHORIZED_USER : (jwtError.name == utility_func.jsonCons.FIELD_TOKEN_EXPIRED_ERROR ? utility_func.jsonCons.FIELD_ACCESS_TOKEN_EXPIRED : (jwtError.name == utility_func.jsonCons.FIELD_ERROR ? utility_func.responseCons.RESP_TOKEN_MALFORMED : jwtError.message)));
        throw utility_func.responseGenerator(errorMsg, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED), true);
    }
}

async function generateJwtRefreshToken(token, refreshOptions) {
    let func_name = 'generateJwtRefreshToken';
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
    const verifyTokenOption = Object.assign({}, refreshOptions, options);
    logger.info(utility_func.logsCons.LOG_PARAM + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' verifyTokenOption => ' + JSON.stringify(verifyTokenOption));
    try {
        const jwtResp = await jwt.verify(token, publicKEY, verifyTokenOption);
        delete jwtResp.iat;
        delete jwtResp.exp;
        delete jwtResp.nbf;
        delete jwtResp.iss;
        delete jwtResp.jti;
        const jwtSignOptions = Object.assign({}, { jwtid: refreshOptions.jwtid, "issuer": refreshOptions.issuer }, refresh_options);
        logger.info(utility_func.logsCons.LOG_PARAM + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' jwtSignOptions => ' + JSON.stringify(jwtSignOptions));
        const refreshTokenResp = await jwt.sign(jwtResp, privateKEY, jwtSignOptions);
        logger.info(utility_func.logsCons.LOG_PARAM + '=>' + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' refreshTokenResp => ' + JSON.stringify(refreshTokenResp));
        return refreshTokenResp;
    } catch (jwtErr) {
        logger.error(utility_func.logsCons.LOG_EXIT + '=>' + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name + ' jwtErr : ' + JSON.stringify(jwtErr));
        let errorMsg = (jwtErr.name == utility_func.jsonCons.FIELD_JSON_WEB_TOKEN_ERROR ? utility_func.responseCons.RESP_UNAUTHORIZED_USER : (jwtErr.name == utility_func.jsonCons.FIELD_TOKEN_EXPIRED_ERROR ? utility_func.jsonCons.FIELD_ACCESS_TOKEN_EXPIRED : (jwtErr.name == utility_func.jsonCons.FIELD_ERROR ? utility_func.responseCons.RESP_TOKEN_MALFORMED : jwtErr.message)));
        throw utility_func.responseGenerator(errorMsg, utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED), true);
    }
}

async function verifyTokenAndRefreshToken(token, jwtId, issuer, isRefreshToken) {
    const func_name = 'verifyTokenAndRefreshToken';
    logger.info(
        `${utility_func.logsCons.LOG_ENTER}${utility_func.logsCons.LOG_SERVICE} => ${func_name}`
    );

    const verificationOptions = isRefreshToken
        ? { ...refresh_options, [utility_func.jsonCons.FIELD_JWT_ID]: jwtId, issuer }
        : { ...options, [utility_func.jsonCons.FIELD_JWT_ID]: jwtId, issuer };

    const verificationKey = publicKEY;

    logger.info(
        `${utility_func.logsCons.LOG_PARAM}${utility_func.logsCons.LOG_SERVICE} verificationOptions => ${JSON.stringify(
            verificationOptions
        )} verificationKey => ${verificationKey}`
    );

    try {
        const tokenResp = await jwt.verify(token, verificationKey, verificationOptions);
        logger.info(
            `${utility_func.logsCons.LOG_EXIT}${utility_func.logsCons.LOG_SERVICE} => ${func_name} => JWT Resp => ${JSON.stringify(
                tokenResp
            )}`
        );
        return tokenResp; 
    } catch (err) {
        logger.error(
            `${utility_func.logsCons.LOG_EXIT} => ${utility_func.logsCons.LOG_SERVICE} => ${func_name} => JWT Error => ${JSON.stringify(
                err
            )}`
        );

        const errorMsg =
            err.name === utility_func.jsonCons.FIELD_JSON_WEB_TOKEN_ERROR
                ? utility_func.responseCons.RESP_UNAUTHORIZED_USER
                : err.name === utility_func.jsonCons.FIELD_TOKEN_EXPIRED_ERROR
                ? utility_func.jsonCons.FIELD_ACCESS_TOKEN_EXPIRED
                : err.name === utility_func.jsonCons.FIELD_ERROR
                ? utility_func.responseCons.RESP_TOKEN_MALFORMED
                : err.message;

        throw utility_func.responseGenerator(
            errorMsg,
            utility_func.statusGenerator(
                utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED,
                utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED
            ),
            true
        );
    }
}

async function verifyTokenFromDB(identifier, apps_name, token, refresh_token) {
    let func_name = 'verifyTokenFromDB'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
    try {
        const user = await userAuth.findOne({ identifier: identifier, apps_name: apps_name, is_active: true, token: token, refresh_token: refresh_token });

        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        return user
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        throw new Error(err.message)
    }
}

async function verifyUserAuth(identifier, apps_name) {
    let func_name = 'verifyUserAuth'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
    try {
        const user = await authManager.findOne({ identifier: identifier, apps_name: apps_name, is_login: true, is_verified: true });
        logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        return user
    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        throw new Error(err.message)
    }
}

async function verifyJwtToken(req, res, next, where_to_redirect) {
    let func_name = 'verifyJwtToken'
    logger.info(utility_func.logsCons.LOG_ENTER + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
    try {
        const tokenResp = await verifyTokenAndRefreshToken(req.headers[utility_func.jsonCons.FIELD_TOKEN], null, req.headers[utility_func.jsonCons.FIELD_APPS_NAME], false);
        const refreshTokenResp = await verifyTokenAndRefreshToken(req.headers[utility_func.jsonCons.FIELD_REFRESH_TOKEN], null, req.headers[utility_func.jsonCons.FIELD_APPS_NAME], true);
        const DBTokenResp = await verifyTokenFromDB(tokenResp[utility_func.jsonCons.FIELD_IDENTIFIER], req.headers[utility_func.jsonCons.FIELD_APPS_NAME], req.headers[utility_func.jsonCons.FIELD_TOKEN], req.headers[utility_func.jsonCons.FIELD_REFRESH_TOKEN]);
        const userAuthResp = await verifyUserAuth(tokenResp[utility_func.jsonCons.FIELD_IDENTIFIER], req.headers[utility_func.jsonCons.FIELD_APPS_NAME]);
        const isIdentifierMatch = tokenResp.identifier === refreshTokenResp.identifier && tokenResp.identifier === DBTokenResp.identifier && tokenResp.identifier === userAuthResp.identifier;
        const isIssMatch = tokenResp.iss === refreshTokenResp.iss && tokenResp.iss === req.headers[utility_func.jsonCons.FIELD_APPS_NAME];

        if (isIdentifierMatch && isIssMatch) {
            req.sessionObject = tokenResp

            if (where_to_redirect == utility_func.jsonCons.FIELD_REDIRECT_TO_NEXT) {
                req.body[utility_func.jsonCons.FIELD_SESSION_OBJECT] = userAuthResp;
                logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
                next();
            } else {
                logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
                return res.status(utility_func.httpStatusCode.StatusCodes.OK).send(utility_func.responseGenerator(
                    utility_func.responseCons.RESP_AUTHORIZED_USER,
                    utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.OK, utility_func.httpStatusCode.StatusCodes.OK),
                    true,
                    userAuthResp)
                );
            }
        } else {
            logger.info(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name);
            return res.status(utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED).send(utility_func.responseGenerator(
                utility_func.responseCons.RESP_UNAUTHORIZED_USER,
                utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
                false,
                null)
            );
        }

    } catch (err) {
        logger.error(utility_func.logsCons.LOG_EXIT + utility_func.logsCons.LOG_SERVICE + ' => ' + func_name)
        return res.status(utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED).send(utility_func.responseGenerator(
            utility_func.responseCons.RESP_UNAUTHORIZED_USER,
            utility_func.statusGenerator(utility_func.httpStatusCode.ReasonPhrases.UNAUTHORIZED, utility_func.httpStatusCode.StatusCodes.UNAUTHORIZED),
            false,
            null)
        );
    }
}


async function verifyJwtTokentoNext(req, res, next) {
    verifyJwtToken(req, res, next, utility_func.jsonCons.FIELD_REDIRECT_TO_NEXT);
}


async function verifyJwtTokentoResponse(req, res, next) {
    verifyJwtToken(req, res, next, utility_func.jsonCons.FIELD_REDIRECT_TO_RESPONSE);

}