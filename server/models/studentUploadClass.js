const mongoose = require("mongoose");

const { Schema } = mongoose;
// ============================================================================
const studentUpload = new Schema({
  uid: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentid: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  name: { type: String, required: true },
  download_url: { type: String, required: true },
  filename: { type: String, required: true },
  foldername: { type: String, required: true },
  marks: { type: Number, default: 0 },
  remarks: { type: String },
  upload_date: { type: Date, default: Date.now() },
  uploaded: { type: Boolean },
});
// ============================================================================
module.exports = mongoose.model("StudentUpload", studentUpload);
