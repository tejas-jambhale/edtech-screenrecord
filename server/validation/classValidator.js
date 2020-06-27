/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
const validator = require('validator');
const isEmpty = require('../util/isEmpty');

module.exports = (req, res, next) => {
    const data = req.body;
    let error = '';

    data.classname = !isEmpty(data.classname) ? data.classname : '';
    
    if (isEmpty(error) && validator.isEmpty(data.classname)) {
        error = 'Classname is required!';
    }

    if (!isEmpty(error)) return res.status(400).json({ error });

    next();
};
