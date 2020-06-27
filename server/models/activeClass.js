/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const activeclassSchema = new Schema({
    teacherid: {  type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classid: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    repeat: [{ type: String, required: true }],
    repeatType: { type: String, required: true },
    notes: { type: String, required: true },
    date: { type: Date, required: true },
    classname: { type: String, required: true },
    timeTo: { type: String, required: true },
    timeFrom: { type: String, required: true },
    subject: { type: String, required: true },
});
// ============================================================================
module.exports = mongoose.model('ActiveClass', activeclassSchema);
