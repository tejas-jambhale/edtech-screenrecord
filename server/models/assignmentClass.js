const mongoose = require('mongoose');

const { Schema } = mongoose;
// ============================================================================
const assignmentSchema = new Schema({
    uid: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: String, required: true },
    download_url: { type: String, required: true },
    title: { type: String, required: true },
    filename: { type: String, required: true },
    foldername: { type: String, required: true },
    max_marks: { type: Number, required: true  },
    notes: { type: String },
    classid: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    due_date: { type: Date, required: true },
});
// ============================================================================
module.exports = mongoose.model('Assignment', assignmentSchema);
