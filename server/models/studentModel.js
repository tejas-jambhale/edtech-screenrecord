/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const studentSchema = new Schema({
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    name: { type: String, required: true },
    regno: { type: String, required: true },
    email: { type: String, required: true },
    schoolid: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classid: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    password: { type: String },
    contact: { type: Number, required: true },
    verified: { type: Boolean, default: false },
});
// ============================================================================
module.exports = mongoose.model('Student', studentSchema);
