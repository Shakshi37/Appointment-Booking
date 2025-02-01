const Joi = require('joi');

// Schema for UpsertSlotBookingService
const upsertSlotBookingSchema = {
    headers: Joi.object({
        token: Joi.string().required().messages({
            "any.required": "'token' is required."
        }),
        refresh_token: Joi.string().required().messages({
            "any.required": "'refresh_token' is required."
        }),
        apps_name: Joi.string().valid('web').required().messages({
            "any.required": "'apps_name' is required and must be 'web'.",
            "any.invalid": "'apps_name' must be 'web'."
        }),
    }),
    body: Joi.object({
        expert_identifier: Joi.string().email().required().messages({
            "string.email": "'expert_identifier' must be a valid email address.",
            "any.required": "'expert_identifier' is required."
        }),
        slot_id: Joi.string().required().messages({
            "any.required": "'slot_id' is required."
        }),
    })
};

// Schema for UpdateBookingStatus
const updateBookingStatusSchema = {
    headers: Joi.object({
        token: Joi.string().required().messages({
            "any.required": "'token' is required."
        }),
        refresh_token: Joi.string().required().messages({
            "any.required": "'refresh_token' is required."
        }),
        apps_name: Joi.string().valid('web').required().messages({
            "any.required": "'apps_name' is required and must be 'web'.",
            "any.invalid": "'apps_name' must be 'web'."
        }),
    }),
    body: Joi.object({
        booking_id: Joi.string().length(24).required().messages({
            "string.length": "'booking_id' must be 24 characters long.",
            "any.required": "'booking_id' is required."
        }),
        status: Joi.string().valid('pending', 'approved', 'canceled').required().messages({
            "any.required": "'status' is required.",
            "any.invalid": "'status' must be one of ['pending', 'approved', 'canceled']."
        }),
    })
};

// Schema for GetUserBooking
const getUserBookingSchema = {
    headers: Joi.object({
        token: Joi.string().required().messages({
            "any.required": "'token' is required."
        }),
        refresh_token: Joi.string().required().messages({
            "any.required": "'refresh_token' is required."
        }),
        apps_name: Joi.string().valid('web').required().messages({
            "any.required": "'apps_name' is required and must be 'web'.",
            "any.invalid": "'apps_name' must be 'web'."
        }),
    })
};

module.exports = { upsertSlotBookingSchema, getUserBookingSchema, updateBookingStatusSchema }