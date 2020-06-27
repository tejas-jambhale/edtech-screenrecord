/* eslint-disable linebreak-style */
/* eslint-disable no-console */
const mongoose = require("mongoose");
require("dotenv").config();

const {
  mongooseConnectionSuccess,
  mongooseConnectionInterrupt,
} = require("../util/constants");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(mongooseConnectionSuccess))
  .catch((err) => console.error(err));

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
// ============================================================================
// When the connection is disconnected:
mongoose.connection.on("disconnected", () => {
  console.log(mongooseConnectionInterrupt);
});

// If the Node process ends, close the Mongoose connection:
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Mongoose default connection disconnected");
    process.exit(0);
  });
});
// ===============================: MODELS :===================================
module.exports.School = require("./schoolModel");
module.exports.Teacher = require("./teacherModel");
module.exports.Student = require("./studentModel");
module.exports.Classroom = require("./classModel");
module.exports.ActiveClass = require("./activeClass");
module.exports.Assignment = require("./assignmentClass");
// module.exports.Media = require('./mediaClass');
module.exports.studentUploads = require("./studentUploadClass");
module.exports.Chime = require("./chimeModel");
module.exports.ScreenRecord = require("./screenrecordingModel");
