const express = require('express');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
const {
    Assignment, Teacher,
} = require('../models');
//= =========================================================================
const router = express.Router();
//= =========================================================================
// @route    GET: /downloadfile/download/:filename
// @desc     link to download file
// @access   Public

router.get('/download/:filename', async (req, res) => {
    const { filename } = req.params;
    const resource = await Assignment.findOne({ filename }, ['uid', 'foldername']);
    const userId = await Teacher.findOne({ _id: resource.uid });
    res.download(path.join(__dirname, `../${process.env.FILE}/${userId.name}/${resource.foldername}/${filename}`)); // set static path to static files
});
//= =========================================================================
module.exports = router;
