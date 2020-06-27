/* eslint-disable linebreak-style */
const notLoggedInValidator = (req, res, next) => ((!req.session.userId) ? res.status(400).json({ error: 'Not Logged In!' }) : next());
module.exports = notLoggedInValidator;
