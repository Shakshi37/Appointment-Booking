const mongoose = require('mongoose');
const { Schema } = mongoose;

const userCategory = new Schema({
    user_category_code:{
        type: Number,
        required: true,
        unique: true,
    },
    user_category_name:{
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('controlcenter.user_category', userCategory);
