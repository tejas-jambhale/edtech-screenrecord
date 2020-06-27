const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { ScreenRecord } = require("../models");
//= =========================================================================
const router = express.Router();
//= =========================================================================
// @route    POST: /api/video    
// @desc     Save screen recording to database
// @access   Protected
router.post('/video', async (req, res) => {
    console.log("hi");
    var video = req.body;
    var vidEncoded = video.toString('base64');
    var finalVideo = {
        video: new Buffer.from(vidEncoded, 'base64')
    };
    await ScreenRecord.create(finalVideo);
    return res.json("Video stored successfully");
})
//= =========================================================================
// @route    GET: /api/video/:id    
// @desc     Save screen recording to database
// @access   Protected
router.get('/video/:id', async (req, res) => {
    var video = await ScreenRecord.findById(req.params.id);

    return res.json(video);
})
//= ==========================================================================
module.exports = router;
