/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const express = require('express');
const { Classroom, ActiveClass, Student } = require('../../models');
//= =========================================================================
const router = express.Router();
//= =========================================================================
// @route    GET: /student/classes
// @desc     get all scheduled class of student
// @access   Protected
router.use('*', async (req, res, next) => {
    const studentid = req.session.userId;
    const user = await Student.findOne({_id: studentid});
    if (user.verified != true) return res.status(401).json({ error: 'Not verified' });
    return next(); 
});
router.get('/classes', async (req, res) => {
    const allClasses = await ActiveClass.find({ classid: req.user.classid }).lean();
    return res.json(allClasses);
});

module.exports = router;
