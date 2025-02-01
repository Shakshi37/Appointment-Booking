const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const userAuthSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true
    },
    refresh_token : {
        type: String,
        required: true
    },
    apps_name: {
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    expires_at: {
        type: String,
        required: true,
    },
    logout_at: {  
        type: String,
        required: false
    },
    createdAt: {
        type: String
    },
    modifiedAt: {
        type: String
    }
}, { timestamps: true });

userAuthSchema.plugin(AutoIncrement, { inc_field: 'token_id' });
userAuthSchema.index({ identifier: 1, is_active: 1 });

module.exports = mongoose.model('controlcenter.user_auths', userAuthSchema);

