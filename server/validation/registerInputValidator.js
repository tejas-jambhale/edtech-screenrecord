/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
const validator = require('validator');
const isEmpty = require('../util/isEmpty');
require('dotenv').config();

module.exports = (req, res, next) => {
    const data = req.body;
    let error = '';
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.googleToken = !isEmpty(data.googleToken) ? data.googleToken : '';
    data.access = !isEmpty(data.access) ? data.access : '';
    data.contact = !isEmpty(data.contact) ? data.contact : '';
    data.referralCode = !isEmpty(data.referralCode) ? data.referralCode : '';

    if (isEmpty(error) && validator.isEmpty(data.access)) {
        error = 'Role is required!';
    }

    if (isEmpty(error) && validator.isEmpty(data.name)) {
        error = 'Name field is required!';
    }

    if (isEmpty(error) && !validator.isLength(data.name, { min: 2, max: 30 })) {
        error = 'Name must be between 2 to 30 characters!';
    }

    if (isEmpty(error) && validator.isEmpty(data.email)) {
        error = 'Email field is required!';
    }

    if (isEmpty(error) && !validator.isEmail(data.email)) {
        error = 'Email is invalid!';
    }

    if (isEmpty(error) && validator.isEmpty(data.password) && isEmpty(data.googleToken)) {
        error = 'Password field is required!';
    }

    if (isEmpty(error) && !validator.isLength(data.password, { min: 6, max: 30 }) && isEmpty(data.googleToken)) {
        error = 'Password must be between 6 to 30 characters!';
    }

    if (isEmpty(error) && validator.isEmpty(data.contact)) {
        error = 'Contact is invalid!';
    }
    
    if(data.access == 'school'){
        data.est = !isEmpty(data.est) ? data.est : '';
        data.estStudents = !isEmpty(data.estStudents) ? data.estStudents : '';
        data.address = !isEmpty(data.address) ? data.address : '';

        if (isEmpty(error) && validator.isEmpty(data.est)) {
            error = 'year is invalid!';
        }

        if (isEmpty(error) && validator.isEmpty(data.estStudents)) {
            error = 'Total Students is invalid!';
        }
        
        if (isEmpty(error) && validator.isEmpty(data.address)) {
            error = 'Address is invalid!';
        }

    } else if(data.access == 'teacher'){
        data.referralCode = !isEmpty(data.referralCode) ? data.referralCode : '';

        if (isEmpty(error) && validator.isEmpty(data.referralCode)) {
            error = 'Referral code is invalid!';
        }
    } else if(data.access == 'student'){
        data.referralCode = !isEmpty(data.referralCode) ? data.referralCode : '';
        data.classid = !isEmpty(data.classid) ? data.classid : '';

        if (isEmpty(error) && validator.isEmpty(data.classid)) {
            error = 'Class is invalid!';
        }

        if (isEmpty(error) && validator.isEmpty(data.referralCode)) {
            error = 'Referral code is invalid!';
        }
    }

    if (!isEmpty(error)) return res.status(400).json({ error });

    next();
};
