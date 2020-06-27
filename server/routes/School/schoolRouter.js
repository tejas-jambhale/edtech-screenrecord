/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const express = require('express');
const { Classroom, Student, Teacher, School } = require('../../models');
const classValidator = require('../../validation/classValidator');
//= =========================================================================
const router = express.Router();
//= =========================================================================
// @route    POST: /school/addclass
// @desc     Add class
// @access   Protected

router.post('/addclass', classValidator, async (req, res) => {
    const { classname } = req.body;
    const schoolid = req.session.userId;
    const exists = await Classroom.findOne({ schoolid, classname });
    if (exists) return res.status(400).json({ error: 'Class already exist' });
    
    let newClass = new Classroom({
        classname, schoolid
    });
    newClass = await newClass.save();
    return res.json(newClass);
});

//= =========================================================================
// @route    GET: /school/classes
// @desc     get all classes
// @access   Protected

router.get('/classes', async (req, res) => {
    const allClasses = await Classroom.find({ schoolid: req.session.userId }).lean();
    return res.json(allClasses);
});

//= ==================================0=======================================
// @route    DELETE: /school/delete/:classId
// @desc     delete class
// @access   Protected

router.delete('/delete/:classId', async (req, res) => {
    await Classroom.findOneAndDelete({ _id: req.params.classId });
    return res.status(200).json({ success: 'Class deleted successfully' });
});

//= =========================================================================
// @route   GET: /school/people?verfied=boolean
// @desc    Get all teachers and students in a school, based on verified query
// @access  Protected

router.get('/people', async (req, res) => {
    const verified = (req.query.verified) ? req.query.verified : false;
    const allTeachers = await Teacher.find({ schoolid: req.session.userId, verified }).select('_id verified name email').lean();
    const allStudents = await Classroom.find({ schoolid: req.session.userId }).populate({path: 'students', select: 'verified name email regno', match: { verified: { $eq: verified }}}).select('classname students');
    return res.status(200).json({ teachers: allTeachers, students: allStudents });
});

//= =========================================================================
// @route   POST: /school/people/:userId
// @desc    Verify a particular user based on userId and status data, or verify all
// @access  Protected

router.post('/people', async (req, res) => {
    if (req.body.userId == undefined) {
        await Teacher.update({ verified: false, schoolid: req.session.userId }, { verified: true }, { multi: true });
        await Student.update({ verified: false, schoolid: req.session.userId }, { verified: true }, { multi: true });
        return res.json({ success: 'Verified all users '});
    }
    const verified = (req.body.status == undefined) ? true : req.body.status;
    const updatedTeacher = await Teacher.findOneAndUpdate({ _id: req.body.userId, schoolid: req.session.userId }, { verified: verified });
    if (!updatedTeacher){
        const updatedStudent = await Student.findOneAndUpdate({ _id: req.body.userId, schoolid: req.session.userId }, { verified: verified });
        return res.json({ success: `${updatedStudent.name}'s verification status updated`});
    }
    return res.json({ success: `${updatedTeacher.name}'s verification status updated`});
});
//= =========================================================================
// @route   GET: /school/referral
// @desc    Get the referral code for the school
// @acceess Protected

router.get('/referral', async (req, res) => {
    const school = await School.findOne({ _id: req.session.userId });
    return res.json({
        success: true,
        referralCode: school.referralCode 
    });
});
//= =========================================================================
// @route   POST: /school/referral
// @desc    Set the referral code for the school
// @acceess Protected

router.post('/referral', async (req, res) => {
    if (req.body.referralCode.length != 5) {
        return res.json({
            success: false,
            message: "The referral code should be of atleast 5 alphanumeric characters"
        });
    }
    await School.findOneAndUpdate({ _id: req.session.userId }, {referralCode: req.body.referralCode });
    return res.json({
        success: true,
        message: "Code updated"
    });
});

module.exports = router;
