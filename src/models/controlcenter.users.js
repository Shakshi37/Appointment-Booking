const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    user_category_code:{
        type: Number,
        required: true,
        ref: 'controlcenter.user_category'
    },
    password: {
        type: String,
        default: null,
        select: false,
    },
    is_password_set: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next(); // Skip if password is not provided
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.plugin(AutoIncrement, { inc_field: 'user_code' });
module.exports = mongoose.model('controlcenter.users', userSchema);
