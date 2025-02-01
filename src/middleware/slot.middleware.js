const Joi = require('joi');

// Schema for UpsertSlotService
const upsertSlotServiceSchema = {
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
        identifier: Joi.string().email().required().messages({
            "string.email": "'identifier' must be a valid email address.",
            "any.required": "'identifier' is required."
        }),
        timeRange: Joi.object({
            startDate: Joi.date().iso().required().messages({
                "any.required": "'startDate' is required and must be in ISO format."
            }),
            endDate: Joi.date().iso().required().messages({
                "any.required": "'endDate' is required and must be in ISO format."
            }),
            startTime: Joi.string().pattern(/^([0-9]{2}):([0-9]{2}):([0-9]{2}) (AM|PM)$/).required().messages({
                "any.required": "'startTime' is required and must follow the pattern 'hh:mm:ss AM/PM'."
            }),
            endTime: Joi.string().pattern(/^([0-9]{2}):([0-9]{2}):([0-9]{2}) (AM|PM)$/).required().messages({
                "any.required": "'endTime' is required and must follow the pattern 'hh:mm:ss AM/PM'."
            }),
        }).required().messages({
            "any.required": "'timeRange' is required."
        }),
        days: Joi.array().items(
            Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday').required().messages({
                "any.required": "'days' must contain valid weekdays excluding Saturday and Sunday."
            })
        ).required().messages({
            "any.required": "'days' is required."
        }).custom((value, helper) => {
            // Check if Saturday or Sunday is included in the days
            if (value.includes('Saturday') || value.includes('Sunday')) {
                return helper.message("'days' should not contain 'Saturday' or 'Sunday'.");
            }
            return value;
        }),
        update: Joi.boolean().required().messages({
            "any.required": "'update' is required."
        }),
    })
};

// Schema for GetSlotsService
const getSlotsServiceSchema = {
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
        identifier: Joi.string().email().required().messages({
            "string.email": "'identifier' must be a valid email address.",
            "any.required": "'identifier' is required."
        })
    })
};

module.exports = {
    upsertSlotServiceSchema, getSlotsServiceSchema

}
