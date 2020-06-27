/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const teacherSchema = new Schema({
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    name: { type: String, required: true },
    email: { type: String, required: true },
    schoolid: { type: Schema.Types.ObjectId, ref: 'School', required: true }, 
    password: { type: String },
    contact: { type: Number, required: true },
    verified: { type: Boolean, default: false },
});
// ============================================================================
module.exports = mongoose.model('Teacher', teacherSchema);
