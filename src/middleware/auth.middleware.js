const Joi = require('joi');


// User Registration Schema
const userRegistrationSchema = {
  body: Joi.object({
    identifier: Joi.string().email().required().messages({
      "string.email": "'identifier' must be a valid email address.",
      "any.required": "'identifier' is required.",
    }),
    user_name: Joi.string().min(3).required().messages({
      "string.min": "'user_name' must be at least 3 characters long.",
      "any.required": "'user_name' is required.",
    }),
    user_category_code: Joi.number().required().messages({
      "any.required": "'user_category_code' is required.",
    }),
  }),
  headers: Joi.object({
    apps_name: Joi.string().valid('web').required().messages({
      "any.required": "'apps_name' is required and must be 'web'.",
      "any.invalid": "'apps_name' must be 'web'.",
    }),
  }),
};

// OTP Verification Schema
const verifyOtpSchema = {
  body: Joi.object({
    identifier: Joi.string().email().required().messages({
      "string.email": "'identifier' must be a valid email address.",
      "any.required": "'identifier' is required.",
    }),
    otp: Joi.string().length(6).required().messages({
      "string.length": "'otp' must be 6 characters long.",
      "any.required": "'otp' is required.",
    }),
    is_login: Joi.boolean().required().messages({
      "any.required": "'is_login' is required.",
    }),
  }),
  headers: Joi.object({
    token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'token' must be a valid JWT token.",
      "any.required": "'token' is required.",
    }),
    refresh_token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'refresh_token' must be a valid JWT token.",
      "any.required": "'refresh_token' is required.",
    }),
    apps_name: Joi.string().valid('web').required().messages({
      "any.required": "'apps_name' is required and must be 'web'.",
      "any.invalid": "'apps_name' must be 'web'.",
    }),
  }),
};

// User Login Schema
const userLoginSchema = {
  body: Joi.object({
    identifier: Joi.string().email().required().messages({
      "string.email": "'identifier' must be a valid email address.",
      "any.required": "'identifier' is required.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "'password' must be at least 6 characters long.",
      "any.required": "'password' is required.",
    }),
  }),
  query: Joi.object({
    is_password_login: Joi.boolean().required().messages({
      "any.required": "'is_password_login' is required.",
    }),
  }),
  headers: Joi.object({
    apps_name: Joi.string().valid('web').required().messages({
      "any.required": "'apps_name' is required and must be 'web'.",
      "any.invalid": "'apps_name' must be 'web'.",
    }),
  }),
};

// Set Password Schema
const setPasswordSchema = {
  body: Joi.object({
    identifier: Joi.string().email().required().messages({
      "string.email": "'identifier' must be a valid email address.",
      "any.required": "'identifier' is required.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "'password' must be at least 6 characters long.",
      "any.required": "'password' is required.",
    }),
  }),
  headers: Joi.object({
    token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'token' must be a valid JWT token.",
      "any.required": "'token' is required.",
    }),
    refresh_token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'refresh_token' must be a valid JWT token.",
      "any.required": "'refresh_token' is required.",
    }),
    apps_name: Joi.string().valid('web').required().messages({
      "any.required": "'apps_name' is required and must be 'web'.",
      "any.invalid": "'apps_name' must be 'web'.",
    }),
  }),
};

// Verify JWT Token Schema
const verifyJwtTokenSchema = {
  headers: Joi.object({
    token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'token' must be a valid JWT token.",
      "any.required": "'token' is required.",
    }),
    refresh_token: Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required().messages({
      "string.pattern.base": "'refresh_token' must be a valid JWT token.",
      "any.required": "'refresh_token' is required.",
    }),
    apps_name: Joi.string().valid('web').required().messages({
      "any.required": "'apps_name' is required and must be 'web'.",
      "any.invalid": "'apps_name' must be 'web'.",
    }),
  }),
};


module.exports = {
    verifyOtpSchema,userRegistrationSchema,userLoginSchema,setPasswordSchema,verifyJwtTokenSchema
};
