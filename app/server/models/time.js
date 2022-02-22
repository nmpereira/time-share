const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  num_work: { type: Number, required: true },
  time_work: { type: Number, required: true },
  num_break: { type: Number, required: true },
  time_break: { type: Number, required: true },
  sets: { type: Number, required: true },
  end_time: { type: Date, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true },
});

module.exports = mongoose.model("Time", timeSchema);
