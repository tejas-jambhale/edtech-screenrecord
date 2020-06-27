/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
const validator = require('validator');
const isEmpty = require('../util/isEmpty');

module.exports = (req, res, next) => {
    const data = req.body;
    let error = '';

    data.classid = !isEmpty(data.classid) ? data.classid : '';
    data.date = !isEmpty(data.date) ? data.date : '';
    data.repeat = !isEmpty(data.repeat) ? data.repeat : [];
    data.notes = !isEmpty(data.notes) ? data.notes : '';
    data.classname = !isEmpty(data.classname) ? data.classname : '';
    data.timeTo = !isEmpty(data.timeTo) ? data.timeTo : '';
    data.timeFrom = !isEmpty(data.timeFrom) ? data.timeFrom : '';
    data.repeatType = !isEmpty(data.repeatType) ? data.repeatType : '';
    data.subject = !isEmpty(data.subject) ? data.subject : '';

    if (isEmpty(error) && validator.isEmpty(data.classid)) {
        error = 'ClassID is required!';
    }
    
    if (isEmpty(error) && validator.isEmpty(data.date)) {
        error = 'Date is required!';
    }

    if (isEmpty(error) && data.repeat.length === 0) {
        error = 'Repeat is required!';
    }

    if (isEmpty(error) && validator.isEmpty(data.notes)) {
        error = 'Notes is required!';
    }

    if (isEmpty(error) && validator.isEmpty(data.classname)) {
        error = 'Classname is required!';
    }
    
    if (isEmpty(error) && validator.isEmpty(data.repeatType)) {
        error = 'Repeat Type is required!';
    }

    if (isEmpty(error) && validator.isEmpty(data.timeTo)) {
        error = 'Time To is required!';
    }
    
    if (isEmpty(error) && validator.isEmpty(data.timeFrom)) {
        error = 'Time From is required!';
    }
    
    if (isEmpty(error) && validator.isEmpty(data.subject)) {
        error = 'Subject is required!';
    }
    
    if (!isEmpty(error)) return res.status(400).json({ error });

    next();
};
