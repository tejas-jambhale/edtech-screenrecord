const validator = require("validator");
const fs = require("fs");
const isEmpty = require("../util/isEmpty");

module.exports = (req, res, next) => {
  const data = req.body;
  let error = "";
  let flag = 0;
  console.log(req.body);

  data.subject = !isEmpty(data.subject) ? data.subject : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.max_marks = !isEmpty(data.max_marks) ? data.max_marks : "";
  data.classid = !isEmpty(data.classid) ? data.classid : "";
  data.due_date = !isEmpty(data.due_date) ? data.due_date : "";

  if (req.files.length === 0) {
    error = "No files found";
    flag = 1;
  }

  if (isEmpty(error) && validator.isEmpty(data.subject)) {
    error = "Subject is required!";
    flag = 1;
  }

  if (isEmpty(error) && validator.isEmpty(data.title)) {
    error = "Title is required!";
    flag = 1;
  }

  if (isEmpty(error) && validator.isEmpty(data.max_marks)) {
    error = "Max Marks is required!";
    flag = 1;
  }

  if (isEmpty(error) && validator.isEmpty(data.classid)) {
    error = "Classname is required!";
    flag = 1;
  }

  if (isEmpty(error) && validator.isEmpty(data.due_date)) {
    error = "Due Date is required!";
    flag = 1;
  }

  if (flag == 1) {
    console.log(error);
    const filePath = `${process.env.FILE}/${req.files[0].filename}`;
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ error });
    });
  }

  if (!isEmpty(error)) return res.status(400).json({ error });

  next();
};
