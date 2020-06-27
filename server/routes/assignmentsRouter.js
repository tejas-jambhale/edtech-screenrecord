const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const { Assignment, studentUploads } = require("../models");
//= =========================================================================
const router = express.Router();
const uploadinputValidator = require("../validation/uploadinputValidator");

const maxSize = 10 * 1024 * 1024;
let flag = 1;
let dir;
//= =========================================================================
async function checkDir(dr) {
  if (!fs.existsSync(dr)) {
    fs.mkdirSync(dr, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(req, files, cb) {
    dir = `${process.env.FILE}/${req.user.name}/${Date.now()}`;
    checkDir(dir);
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // date used for ID of filename
  },
});
const upload = multer({
  storage,
});

function checkSize(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  if (fileSizeInBytes > maxSize) {
    flag = 1;
  }
}

function rmDir(dir1, rmSelf) {
  let files;
  rmSelf = rmSelf === undefined ? true : rmSelf;
  dir1 += "/";
  try {
    files = fs.readdirSync(dir1);
  } catch (e) {
    console.log("!Oops, directory not exist.");
    return;
  }
  if (files.length > 0) {
    files.forEach((x, i) => {
      if (fs.statSync(dir1 + x).isDirectory()) {
        rmDir(dir1 + x);
      } else {
        fs.unlinkSync(dir1 + x);
      }
    });
  }
  if (rmSelf) {
    // check if user want to delete the directory ir just the files in this directory
    fs.rmdirSync(dir1);
  }
}
//= =========================================================================
// @route    GET: /media/getresources
// @desc     Get a list of all files
// @access   Protected

router.get("/getAssignments/:id", async (req, res) => {
  console.log(req.params.id);
  const resources = await Assignment.find({ uid: req.params.id });
  console.log(resources);
  res.json(resources);
});

//= ==========================================================================
// @route    POST: /assignment/upload
// @desc     Save file locally on server
// @access   Protected

router.post(
  "/upload",
  upload.array("files", 5),
  uploadinputValidator,
  async (req, res) => {
    // max 5 files can be uploaded at a time
    const { subject, title, due_date, max_marks, notes, classid } = req.body;
    const hostURL = `${req.protocol}://${req.get("host")}/${
      process.env.NODE_ENV === "development" ? "" : "api/"
    }`;
    console.log(req);
    const { filename } = req.files[0];
    const fileExt = req.files[0].filename.split(".")[1];
    const filePath = `${process.env.FILE}/${req.user.name}/${
      dir.split("/")[dir.split("/").length - 1]
    }/${req.files[0].filename}`;
    const folderPath = `${process.env.FILE}/${req.user.name}/${
      dir.split("/")[dir.split("/").length - 1]
    }`;
    const staticPath = `${req.user.name}/${
      dir.split("/")[dir.split("/").length - 1]
    }`;
    flag = 0;
    const newResource = new Assignment();
    newResource.uid = req.user._id;
    newResource.subject = subject;
    newResource.title = title;
    newResource.due_date = due_date;
    newResource.max_marks = max_marks;
    newResource.notes = notes;
    newResource.classid = classid;
    newResource.download_url = `${hostURL}downloadfile/download/${filename}`;
    newResource.filename = filename;
    newResource.foldername = dir.split("/")[dir.split("/").length - 1];
    if (fileExt.match(/^(pdf|doc)$/)) {
      checkSize(filePath);
    } else {
      rmDir(folderPath);
      return res.status(415).json({ error: "Type not supported" });
    }
    if (flag === 1) {
      rmDir(folderPath);
      return res.status(415).json({ error: "File size limited" });
    }
    const docs = await newResource.save();
    return res.json(docs);
  }
);
//= =========================================================================
// @route    DELETE: /assignment/delete/:assignmentID
// @desc     Delete Resource
// @access   Protected

router.delete("/delete/:assignmentID", async (req, res) => {
  const resource_ID = req.params.assignmentID;
  const file_resource = await Assignment.find({ _id: resource_ID });
  const folder_path = `${process.env.FILE}/${req.user.name}/${file_resource[0].foldername}`;
  await Assignment.findOneAndDelete({ _id: resource_ID });
  rmDir(folder_path);
  return res.status(200).json({ success: "Assignment Deleted" });
});

//= =========================================================================
// @route    GET: /assignment/:assignmentID
// @desc     get all assignments marks
// @access   Protected

router.get("/:assignmentid", async (req, res) => {
  // console.log(req.params.assignmentid);
  const assignment = await Assignment.findOne({ _id: req.params.assignmentid });
  const max_marks = assignment.max_marks;
  const resources = await studentUploads.find({
    assignmentid: req.params.assignmentid,
  });
  resources.unshift(max_marks);
  return res.status(200).json(resources);
});

//= =========================================================================
// @route    POST: /assignment/marks/:assignmentID
// @desc     upload marks
// @access   Protected

router.post("/marks/:assignmentID", async (req, res) => {
  const resource_ID = req.params.assignmentID;
  const updatedDoc = req.body;
  console.log(updatedDoc);
  for (let i = 0; i < updatedDoc.length; i++) {
    console.log(updatedDoc[i].uid + " " + updatedDoc[i].marks);
    await studentUploads.updateOne(
      {
        $and: [
          { assignmentid: mongoose.Types.ObjectId(resource_ID) },
          { uid: mongoose.Types.ObjectId(updatedDoc[i].uid) },
        ],
      },
      { $set: { marks: parseInt(updatedDoc[i].marks) } }
    );
  }
  return res.status(200).json({ msg: "marks updated" });
});

//= ==========================================================================
module.exports = router;
