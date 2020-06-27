const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { studentUploads, Assignment } = require("../../models");
//= =========================================================================
const router = express.Router();

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
  const resources = await Assignment.find({ classid: req.params.id });
  res.json(resources);
});

//= ==========================================================================
// @route    POST: /assignment/upload
// @desc     Save file locally on server
// @access   Protected

router.post("/upload", upload.array("files", 5), async (req, res) => {
  // max 5 files can be uploaded at a time
  console.log(req.body.uploaded);
  const assignmentID = req.body.assignmentid;
  const hostURL = `${req.protocol}://${req.get("host")}/${
    process.env.NODE_ENV === "development" ? "" : "api/"
  }`;
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
  const newResource = new studentUploads();
  newResource.uid = req.user._id;
  newResource.name = req.user.name;
  newResource.download_url = `${hostURL}downloadfile/download/${filename}`;
  newResource.filename = filename;
  newResource.foldername = dir.split("/")[dir.split("/").length - 1];
  newResource.assignmentid = assignmentID;
  newResource.uploaded = req.body.uploaded;
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
});
//= =========================================================================
// @route    DELETE: /assignment/delete/:assignmentID
// @desc     Delete Resource
// @access   Protected

router.delete("/delete/:id/:assignmentID", async (req, res) => {
  const resource_ID = req.params.assignmentID;
  const file_resource = await studentUploads.find({
    $and: [{ uid: req.params.id }, { assignmentid: resource_ID }],
  });
  console.log(file_resource);
  const folder_path = `${process.env.FILE}/${req.user.name}/${file_resource[0].foldername}`;
  const updatedDoc = await studentUploads.findOneAndDelete({
    $and: [{ uid: req.params.id }, { assignmentid: resource_ID }],
  });
  rmDir(folder_path);
  return res.status(200).json(updatedDoc);
  // return res.status(200).json({ success: 'studentUploads Deleted' });
});

//= =========================================================================
// @route    GET: /uploaded/:id/:assignmentid
// @desc     Check if assignment is uploaded or not
// @access   Protected
//= ==========================================================================

router.post("/uploaded/:id", async (req, res) => {
  const { assignmentid } = req.body;
  let uploads = [];
  for (let i = 0; i < assignmentid.length; i++) {
    const uploaded = await studentUploads.exists({
      $and: [{ uid: req.params.id }, { assignmentid: assignmentid[i]._id }],
    });
    uploads.push(uploaded);
  }
  res.status(200).json(uploads);
});
module.exports = router;
