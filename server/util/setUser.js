/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const isEmpty = require('./isEmpty');
const { School, Student, Teacher } = require('../models');
//= =========================================================================
const setUser = async (req, res, next) => {
    const { userId, access } = req.session;
    if (!isEmpty(userId)) {
        if (access == 'student') {
            const user = await Student.findById(userId)
            .lean()
            .catch(() => {});  
            const payload = {
                _id: user._id,
                access: access,
                name: user.name,
                email: user.email,
                schoolid: user.schoolid,
                classid: user.classid,
                regno: user.regno
            };
            req.user = payload;  
        } else if (access == 'teacher') {
            const user = await Teacher.findById(userId)
            .lean()
            .catch(() => {});
            const payload = {
                _id: user._id,
                access: access,
                name: user.name,
                email: user.email,
                schoolid: user.schoolid
            };
            req.user = payload;
        } else {
            const user = await School.findById(userId)
            .lean()
            .catch(() => {});
            const payload = {
                _id: user._id,
                access: access,
                name: user.name,
                email: user.email
            };
            req.user = payload;
        }        
    }
    next();
};
//= =========================================================================
module.exports = setUser;
