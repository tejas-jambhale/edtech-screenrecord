/* eslint-disable linebreak-style */
/* eslint-disable valid-typeof */

const isEmpty = (value) => value === undefined
    || value === null
    || (typeof value === 'object' && Object.keys(value).length === 0)
    || (typeof value === 'string' && value.trim().length === 0)
    || (typeof value === 'array' && value.length === 0);

module.exports = isEmpty;
