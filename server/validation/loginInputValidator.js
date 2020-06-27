/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
const validator = require('validator');
const isEmpty = require('../util/isEmpty');

module.exports = (req, res, next) => {
    const data = req.body;
    let error = '';

    data.access = !isEmpty(data.access) ? data.access : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (isEmpty(error) && validator.isEmpty(data.access)) {
        error = 'Role is required!';
    }
    
    if (isEmpty(error) && validator.isEmpty(data.email)) {
        error = 'Email is required!';
    }

    if (isEmpty(error) && !validator.isLength(data.password, { min: 6, max: 30 })) {
        error = 'Password must be between 6 to 30 characters!';
    }

    if (isEmpty(error) && validator.isEmpty(data.password)) {
        error = 'Password field is required!';
    }

    if (!isEmpty(error)) return res.status(400).json({ error });

    next();
};
