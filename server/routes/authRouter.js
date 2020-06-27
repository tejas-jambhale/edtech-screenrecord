/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();
const { School, Teacher, Student, Classroom } = require('../models');
const isEmpty = require('../util/isEmpty');
const {
    userAlreadyRegistered,
    passwordIncorrect,
    usernameNotFound,
    logoutError,
    logoutSuccess,
    googleSigninError
} = require('../util/constants');
const randomstring = require('randomstring');

const fetchPayload = require('../util/detailsFromGoogleToken');

const googleSignInCheck = require('../util/googleSignIn');


//= =========================================================================
const router = express.Router();
const isLoggedInValidator = require('../validation/isLoggedInValidator');
const notLoggedInValidator = require('../validation/notLoggedInValidator');
const registerInputValidator = require('../validation/registerInputValidator');
const loginInputValidator = require('../validation/loginInputValidator');
//= =========================================================================
// @route    GET: /auth/listschools
// @desc     Get all Schools
// @access   Public

router.get('/listschools', async (req, res) => {
    const listUsers = await School.find({});
    return res.status(200).json(listUsers);
});

//= =========================================================================
// @route    GET: /auth/:schoolid
// @desc     Get all classes of school
// @access   Public

router.get('/:schoolid', async (req, res) => {
    const listClasses = await Classroom.find({ schoolid: req.params.schoolid });
    return res.status(200).json(listClasses);
});

//= =========================================================================
// @route    POST: /auth/register
// @desc     Register the user
// @access   Public

router.post('/register', isLoggedInValidator, registerInputValidator, async (req, res) => {
    const access = req.body.access;
    const googleSignIn = req.body.googleToken != undefined && req.body.googleToken != '';
    if (googleSignIn) {
        let payload = await fetchPayload(req.body.googleToken);
        payload = payload.payload;
        if (payload === false) {
            return res.json({ error: googleSigninError });
        }
        if (payload.email != req.body.email) {
            return res.json({ error: googleSigninError });       
        }
    }

    if(access === 'school'){
        const {
            name, address, email, contact, est, estStudents, password
        } = req.body;
        const exists = await School.findOne({ name });
        if (exists) return res.status(400).json({ error: userAlreadyRegistered });
    
        let referralCode = randomstring.generate({
            length: 5,
            charset: 'alphabetic'
        });

        let newSchool = new School({
            name, address, email, contact, est, estStudents, password, referralCode 
        });
        if (!googleSignIn) {
            // eslint-disable-next-line radix
            const salt = await bcrypt.genSalt(parseInt(process.env.SALT_LENGTH));
            const hash = await bcrypt.hash(password, salt);
        
            newSchool.password = hash;
        }
        newSchool = await newSchool.save();
        req.session.userId = newSchool._id;
        req.session.access = access;
        
        const payload = {
            _id: newSchool._id,
            access: access,
            name: newSchool.name,
            email: newSchool.email,
        };
        return res.json(payload);
    } else if(access === 'teacher'){
        const {
            name, email, referralCode, password, contact
        } = req.body;
        const exists = await Teacher.findOne({ email });
        if (exists) return res.status(400).json({ error: userAlreadyRegistered });
        
        const codeExists = await School.findOne({ referralCode: referralCode });
        if (!codeExists) return res.status(400).json({ error: 'School does not exist' });

        const schoolid = codeExists._id;
        
        let newTeacher = new Teacher({
            name, email, schoolid, password, contact,
        });

        if (!googleSignIn) {
            // eslint-disable-next-line radix
            const salt = await bcrypt.genSalt(parseInt(process.env.SALT_LENGTH));
            const hash = await bcrypt.hash(password, salt);
        
            newTeacher.password = hash;
        }

        newTeacher = await newTeacher.save();
        req.session.userId = newTeacher._id;
        req.session.access = access;
        
        const payload = {
            _id: newTeacher._id,
            schoolid: newTeacher.schoolid,
            access: access,
            name: newTeacher.name,
            email: newTeacher.email,
        };

        // const dir = `${process.env.FILE}/${newTeacher.name}`;
        // if (!fs.existsSync(dir)) {
        //     fs.mkdirSync(dir);
        // }
    
        return res.json(payload);
    } else if(access === 'student'){
        const {
            name, email, regno, password, contact, classid, referralCode
        } = req.body;

        const exists = await Student.findOne({ email });
        if (exists) return res.status(400).json({ error: userAlreadyRegistered });
        
        const codeExists = await School.findOne({ referralCode: referralCode });
        if (!codeExists) return res.status(400).json({ error: 'School does not exist' });


        const schoolid = codeExists._id;

        let newStudent = new Student({
            name, email, regno, password, contact, classid, schoolid
        });
        
        if (!googleSignIn) {
            // eslint-disable-next-line radix
            const salt = await bcrypt.genSalt(parseInt(process.env.SALT_LENGTH));
            const hash = await bcrypt.hash(password, salt);
        
            newStudent.password = hash;
        }    
        
        newStudent = await newStudent.save();
        req.session.userId = newStudent._id;
        req.session.access = access;

        await Classroom.findOneAndUpdate({ _id: classid }, {"$push": {"students": newStudent._id }})

        
        const payload = {
            _id: newStudent._id,
            schoolid: newStudent.schoolid,
            classid: newStudent.classid,
            access: access,
            name: newStudent.name,
            email: newStudent.email,
            regno: newStudent.regno,
        };
        return res.json(payload);
    } else {
        return res.status(400).json({ error: 'Access Not Valid' });
    }
});
//= =========================================================================
// @route    POST: /auth/login
// @desc     Login user
// @access   Public

router.post('/login', isLoggedInValidator, googleSignInCheck, loginInputValidator, async (req, res) => {
    const access = req.body.access;
    const { email, password } = req.body;
    
    let user;
    
    if(access === 'school'){
        user = await School.findOne({ email }).lean();
        
        if (!user) return res.status(404).json({ error: usernameNotFound });
        if (access != 'school' && user.verified != true) return res.status(401).json({ error: 'Not verified' });
        
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({ error: passwordIncorrect });
        req.session.userId = user._id;
        req.session.access = access;
        
            const payload = {
            _id: user._id,
            access: access,
            name: user.name,
            email: email,
        };
        return res.json(payload);
        
    } else if(access === 'teacher'){
        user = await Teacher.findOne({ email }).lean();
        
        if (!user) return res.status(404).json({ error: usernameNotFound });
        if (access != 'school' && user.verified != true) return res.status(401).json({ error: 'Not verified' });
        
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({ error: passwordIncorrect });
        req.session.userId = user._id;
        req.session.access = access;
        
            const payload = {
            _id: user._id,
            schoolid: user.schoolid,
            access: access,
            name: user.name,
            email: email,
        };
        return res.json(payload);
        
    } else if(access === 'student'){
        user = await Student.findOne({ email }).lean();
    
        if (!user) return res.status(404).json({ error: usernameNotFound });
        if (access != 'school' && user.verified != true) return res.status(401).json({ error: 'Not verified' });
        
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({ error: passwordIncorrect });
        req.session.userId = user._id;
        req.session.access = access;
        
            const payload = {
            _id: user._id,
            schoolid: user.schoolid,
            classid: user.classid,
            access: access,
            name: user.name,
            email: email,
            regno: user.regno,
        };
        return res.json(payload);
    }
    // if (user && access == 'teacher') {
    //     const dir = `${process.env.FILE}/${user.name}`;
    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir);
    //     }
    // }
});
//= =========================================================================
// @route    POST: /auth/logout
// @desc     Logout user
// @access   Public

router.post('/logout', notLoggedInValidator, (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(400).json({ error: logoutError });

        res.clearCookie(process.env.SESS_NAME);
        res.json({ logoutSuccess });
    });
});
//= =========================================================================
module.exports = router;
