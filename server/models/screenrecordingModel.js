const mongoose = require("mongoose");
const { encodeBase64, decodeBase64 } = require("bcryptjs");

const { Schema } = mongoose;
// ============================================================================
const screenRecord = new Schema({
  contentType: { type: String, default: '.webm' },
  video: { type: String, required: true },
  date: { type: Date, default: Date.now() },
});
// ============================================================================
module.exports = mongoose.model("ScreenRecord", screenRecord);
