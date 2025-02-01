const express = require('express');
const router = express.Router();
const ProductController = require('../controller/auth.controller');
const jwtAuth = require('../middleware/jwt-middleware');
const {validateRequest} = require('../middleware/validator.middleware')
const {verifyOtpSchema,userRegistrationSchema,userLoginSchema,setPasswordSchema,verifyJwtTokenSchema} = require('../middleware/auth.middleware')



router.post('/registration/v1', validateRequest(userRegistrationSchema),ProductController.userRegistrationController);
router.post('/verify/otp/v1',validateRequest(verifyOtpSchema),jwtAuth.verifyJwtTokentoNext, ProductController.verifyOtpController);
router.post('/login/v1',validateRequest(userLoginSchema),ProductController.userLoginController);
router.post('/set/password/v1',validateRequest(setPasswordSchema),jwtAuth.verifyJwtTokentoNext, ProductController.setPasswordController);
router.post('/verify/Jwt/token/v1',validateRequest(verifyJwtTokenSchema),jwtAuth.verifyJwtTokentoResponse);

module.exports = router;
