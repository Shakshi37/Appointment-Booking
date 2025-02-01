const mongoose = require('mongoose');
const { Schema } = mongoose;

const SlotUpsert = new Schema({
    identifier: { type: String, required: true, ref: 'controlcenter.users' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    max_bookings : { type: Number, default: 5},
});

module.exports = mongoose.model('slot.slot_upsert', SlotUpsert);
