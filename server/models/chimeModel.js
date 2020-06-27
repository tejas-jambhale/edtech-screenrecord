/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const chimeSchema = new Schema({
    chimeObj: { type: String },
    roomid: { type: String },
    date: { type: Date, default: Date.now() }
});
// ============================================================================
module.exports = mongoose.model('Chime', chimeSchema);
