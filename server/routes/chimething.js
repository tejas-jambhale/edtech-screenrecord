const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
const Chime = require("../models/chimeModel");
const router = express.Router();

let awsChime = new AWS.Chime({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});
awsChime.endpoint = new AWS.Endpoint(
  "https://service.chime.aws.amazon.com/console"
);

router.get("/:roomid", async (req, res) => {
  const roomid = req.params.roomid;
  let meetingResponse = await Chime.findOne({ roomid }).lean();
  if (meetingResponse) {
    meetingResponse = JSON.parse(meetingResponse.chimeObj);
  } else {
    meetingResponse = await awsChime
      .createMeeting({
        ClientRequestToken: uuid(),
        MediaRegion: "us-east-1",
      })
      .promise();

    let newMeeting = new Chime({
      roomid,
      chimeObj: JSON.stringify(meetingResponse),
    });
    newMeeting = await newMeeting.save();
  }

  let attendeeResponse = await awsChime
    .createAttendee({
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId: uuid(),
    })
    .promise();

  console.log("CHIME Response:", meetingResponse, attendeeResponse);

  return res
    .status(200)
    .send(JSON.stringify({ meetingResponse, attendeeResponse }));
});

module.exports = router;
