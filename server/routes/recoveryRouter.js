const express = require("express");
const crypto = require("crypto");
const async = require("async");
const bcrypt = require("bcryptjs");
const sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const { School, Student, Teacher } = require("../models");
//= =========================================================================
const router = express.Router();
//= =========================================================================
// @route    POST: /recovery/forgotpassword
// @desc     Accepts email and sends link for reset password
// @access   Protected

router.post("/forgotpassword", (req, res) => {
  const { access } = req.body;
  async.waterfall(
    [
      // eslint-disable-next-line func-names
      function (done) {
        crypto.randomBytes(16, (err, buf) => {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      // eslint-disable-next-line func-names
      function (token, done) {
        // eslint-disable-next-line consistent-return
        if (access == "Teacher") {
          Teacher.findOne({ email: req.body.email }, (err, user) => {
            // console.log(user);
            if (!user) {
              return res
                .status(404)
                .json({ error: "No account found with that email address" });
            }
            user.resetPasswordToken = token; // check schema
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save((_err) => {
              done(_err, token, user);
            });
          });
        } else {
          Student.findOne({ email: req.body.email }, (err, user) => {
            // console.log(user);
            if (!user) {
              return res
                .status(404)
                .json({ error: "No account found with that email address" });
            }
            user.resetPasswordToken = token; // check schema
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save((_err) => {
              done(_err, token, user);
            });
          });
        }
      },
      // eslint-disable-next-line func-names
      function (token, user) {
        const resetURL = `${req.get("origin")}/reset/${token}`;
        const mailDetails = {
          to: user.email,
          from: process.env.EMAIL, // official email address
          subject: "Reset your password for CamCann",
          text: `Click the following link to reset your password: 
                ${resetURL}`,
        };
        sendgrid.send(mailDetails);
        return res.json({ msg: "success" });
      },
    ],
    (err, next) => {
      if (err) return next(err);
      return res.status(400).json({ error: err });
    }
  );
});
//= =========================================================================
// @route    GET: /recovery/resetpassword/:token
// @desc     Renders reset password form from the link in mail
// @access   Protected

router.get("/resetpassword/:token", async (req, res) => {
  const Token = req.params.token;
  const userS = await Student.findOne({
    resetPasswordToken: Token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  const userT = await Teacher.findOne({
    resetPasswordToken: Token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!userS && !userT) {
    res
      .status(400)
      .json({ error: "Password reset has expired or Token is invalid." });
  } else {
    res.json({ token: Token });
  } // reset password page with token
});
//= ==========================================================================
// @route    POST: /recovery/resetpassword
// @desc     Resets password
// @access   Protected

router.post("/resetpassword", async (req, res) => {
  // eslint-disable-next-line func-names
  console.log(req.body.token);
  const userT = await Teacher.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  const userS = await Student.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // user = user[0];
  if (!userS && !userT) {
    return res
      .status(403)
      .json({ error: "Password reset token is invalid or has expired." });
  }
  if (userS !== null) {
    if (req.body.password === req.body.confirm) {
      const { password } = req.body;

      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_LENGTH));
      const hash = await bcrypt.hash(password, salt);
      userS.password = hash;
      userS.resetPasswordToken = undefined;
      userS.resetPasswordExpires = undefined;
      await userS.save();
    } else {
      return res.status(403).json({ error: "Password do not match" });
    }
    // eslint-disable-next-line func-names
    const mailDetails = {
      to: userS.email,
      from: process.env.EMAIL, // official email address
      subject: "Password is changed",
      text: "Password has been changed successfully",
    };
    sendgrid.send(mailDetails, () => {
      res.status(200).json({ success: "Password is changed successfully" }); // home page
    });
  } else {
    if (req.body.password === req.body.confirm) {
      const { password } = req.body;

      console.log("pass:" + req.body.password);
      console.log("Confirm:" + req.body.confirm);
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_LENGTH));
      const hash = await bcrypt.hash(password, salt);
      userT.password = hash;
      userT.resetPasswordToken = undefined;
      userT.resetPasswordExpires = undefined;
      await user.save();
    } else {
      return res.status(403).json({ error: "Password do not match" });
    }
    // eslint-disable-next-line func-names
    const mailDetails = {
      to: userT.email,
      from: process.env.EMAIL, // official email address
      subject: "Password is changed",
      text: "Password has been changed successfully",
    };
    sendgrid.send(mailDetails, () => {
      res.status(200).json({ success: "Password is changed successfully" }); // home page
    });
  }
});
//= ==========================================================================
module.exports = router;
