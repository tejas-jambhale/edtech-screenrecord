/* eslint-disable linebreak-style */
const isLoggedInValidator = (req, res, next) => ((req.session.userId) ? res.status(400).json({ error: 'Already Logged In!' }) : next());
module.exports = isLoggedInValidator;
