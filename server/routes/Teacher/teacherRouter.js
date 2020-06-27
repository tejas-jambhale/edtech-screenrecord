/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const express = require('express');
const { Classroom, ActiveClass, Teacher } = require('../../models');
const scheduleValidator = require('../../validation/scheduleValidator');
//const {chimeAction} = require('../../util/chimeMeeting');
//= =========================================================================
const router = express.Router();

router.use('*', async (req, res, next) => {
   const teacherid = req.session.userId;
   const user = await Teacher.findOne({_id: teacherid});
   if (user.verified != true) return res.status(401).json({ error: 'Not verified' });
   return next(); 
});
//= =========================================================================
// @route    POST: /teacher/schedule
// @desc     Schedule class
// @access   Protected

router.post('/schedule', scheduleValidator, async (req, res) => {
    const { classid, repeatType, timeTo, timeFrom, repeat, date, classname, notes, subject } = req.body;
    const teacherid = req.session.userId;

    const Timetoexists = await ActiveClass.findOne({ teacherid, timeTo });
    const Timefromexists = await ActiveClass.findOne({ teacherid, timeFrom });
    if (Timetoexists && Timefromexists) return res.status(400).json({ error: 'Class already exist' });
    
    let newClass = new ActiveClass({
        classid, teacherid, repeat, repeatType, timeTo, timeFrom, classname, date, notes, subject
    });
    newClass = await newClass.save();
    return res.json(newClass);
});
//= =========================================================================
// @route    GET: /teacher/classes
// @desc     get all classes
// @access   Protected

router.get('/classes', async (req, res) => {
    const allClasses = await Classroom.find({ schoolid: req.user.schoolid }).lean();
    return res.json(allClasses);
});

//= =========================================================================
// @route    GET: /teacher/activeclasses
// @desc     get all Active classes
// @access   Protected

router.get('/activeclasses', async (req, res) => {
    const allClasses = await ActiveClass.find({ teacherid: req.session.userId }).lean();
    return res.json(allClasses);
});
//= =========================================================================
// @route    PUT: /teacher/update/:id
// @desc     update Active classes
// @access   Protected

router.get('/update/:id', async (req, res) => {
    const activeId = req.param.id;
    const { classid, repeatType, timeTo, timeFrom, repeat, date, classname, notes, subject } = req.body;
    const teacherid = req.session.userId;

    const Timetoexists = await ActiveClass.findOne({ teacherid, timeTo });
    const Timefromexists = await ActiveClass.findOne({ teacherid, timeFrom });
    if (Timetoexists && Timefromexists) return res.status(400).json({ error: 'Class already exist' });
    
    
    await ActiveClass.findOneAndUpdate({ _id: activeId },
        {
            $set: {
                classid, repeatType, timeTo, timeFrom, repeat, date, classname, notes, subject
            },
        });
    const updatedDoc = await ActiveClass.find({ _id: activeId });
    return res.json(updatedDoc[0]);

});

//= =========================================================================
// @route    DELETE: /teacher/delete/:classId
// @desc     delete class
// @access   Protected

router.delete('/delete/:classId', async (req, res) => {
    await ActiveClass.findOneAndDelete({ _id: req.params.classId });
    return res.status(200).json({ success: 'Class deleted successfully' });
});
//= =========================================================================
// @route    GET: /teacher/chime/:roomid
// @desc     set up chime meeting
// @access   Protected

router.get('/chime/:roomid', async (req, res) => {
   const { meetingResponse, attendeeResponse } = await chimeAction(req.params.roomid);
   console.log("LINE LOG 98", meetingResponse, attendeeResponse);    
   return res.status(200).send(JSON.stringify({meetingResponse, attendeeResponse}));
});
//= =========================================================================

module.exports = router;
