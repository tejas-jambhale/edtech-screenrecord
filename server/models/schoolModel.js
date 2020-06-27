/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const schoolSchema = new Schema({ // school, class ids
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: Number, required: true },
    email: { type: String, required: true },
    est: { type: String, required: true },
    estStudents: { type: Number, required: true },
    password: { type: String },
    referralCode: { type: String, unique: true },
});
// ============================================================================
module.exports = mongoose.model('School', schoolSchema);
