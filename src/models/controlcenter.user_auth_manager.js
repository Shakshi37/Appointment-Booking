const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const authManagerSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        minlength: 4,
        maxlength: 6,
        default: null
    },
    is_login:{
        type: Boolean,
        required: true
    },
    apps_name: {
        type: String,
        required: true,
    },
    expires_at: {
        type: Date,
        required: true
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: String
    },
    modifiedAt: {
        type: String
    }
}, { timestamps: true });

authManagerSchema.plugin(AutoIncrement, { inc_field: 'id' });
authManagerSchema.index({ identifier: 1, otp_code: 1, expires_at: 1 });

module.exports = mongoose.model('controlcenter.user_auth_manager', authManagerSchema);

