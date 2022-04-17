const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  num_work: { type: Number },
  time_work: { type: Number },
  num_break: { type: Number },
  time_break: { type: Number },
  sets: { type: Number },
  paused: { type: Boolean },
  end_time: { type: Date },
  pomo_count: { type: Number },
  break_count: { type: Number },
  updateLog: { type: Array },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true },
});

module.exports = mongoose.model("Time", timeSchema);
