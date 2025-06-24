const mongoose = require("mongoose");

const dailySequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Will store the date string 'YYYYMMDD'
  sequence_value: { type: Number, default: 0 },
});

const DailySequence = mongoose.model("DailySequence", dailySequenceSchema);

module.exports = DailySequence;
