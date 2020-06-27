/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const classSchema = new Schema({
    schoolid: {  type: Schema.Types.ObjectId, ref: 'School', required: true },
    classname: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
});
// ============================================================================
module.exports = mongoose.model('Classroom', classSchema);
