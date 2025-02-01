const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, 
    expert_id: { type: String, required: true }, 
    slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "slot.slot_upsert", required: true }, 
    status: { 
      type: String, 
      enum: ["pending", "approved", "canceled"], 
      default: "pending" 
    },
    created_at: { type: Date, default: Date.now },
  });

module.exports = mongoose.model("slot.slot_booking", bookingSchema);
