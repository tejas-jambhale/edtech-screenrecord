const { googleSigninError, usernameNotFound } = require('./constants');
const { School, Teacher, Student } = require('../models/index');

const fetchPayload = require('./detailsFromGoogleToken');

const isEmpty = require('./isEmpty');

/***
 * @desc    Checks if user exists, if the user opts to login via google
 */
module.exports = async (req, res, next) => {
    if (isEmpty(req.body.access)) {
        return res.status(400).json({
            error: 'Role is required!'
        })
    }
    if (req.body.googleToken === undefined || req.body.googleToken === "") {
        return next();
    }

    try {
        let returnedPayload = await fetchPayload(req.body.googleToken);
        returnedPayload = returnedPayload.payload;
        if (returnedPayload === false) {
            return res.json({ error: googleSigninError });
        }

        if (returnedPayload.email == req.body.email) {
            const email = returnedPayload.email;
            const access = req.body.access;
            
            let user;
            if(access === 'school'){
                user = await School.findOne({ email }).lean();
            } else if(access === 'teacher'){
                user = await Teacher.findOne({ email }).lean();
            } else if(access === 'student'){
                user = await Student.findOne({ email }).lean();
            }
            if (!user) return res.status(404).json({ error: usernameNotFound });
            if (user.verified != true) return res.status(401).json({ error: 'Not verified' });
            
            req.session.userId = user._id;
            req.session.access = access;
                
            const payload = {
                _id: user._id,
                access: access,
                name: user.name,
                email: email,
            };
            return res.json(payload);
        }
        console.log(22)
        return res.json({ error: googleSigninError });
    } catch(err) {
        return res.json({ error: googleSigninError });
    }   
}