const cron = require('node-cron');
const randomstring = require('randomstring');

const {School} = require('../models/index');

async function updateCode(schools, index) {
    if (index == schools.length) return;
    let code = randomstring.generate({
        length: 5,
        charset: 'alphabetic'
    });
    try {
        await School.findOneAndUpdate({_id: schools[index]._id}, {referralCode: code});
    } catch (err) {
        console.log(`Error updating referral code of ${schools[index].name}`);
    }
    updateCode(schools, index+1);
}

module.exports = () => {
    cron.schedule('* * */4 * *', async () => {
        try {
            let schools = await School.find({});
            updateCode(schools, 0);
        } catch (err) {
            console.log("Error finding schools");
        }
    });
    return;
};