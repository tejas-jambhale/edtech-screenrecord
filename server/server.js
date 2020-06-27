/* eslint-disable linebreak-style */
/* eslint-disable no-console */
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./util/messages");
const MongoStore = require("connect-mongo")(session);
const authRoutes = require("./routes/authRouter");
const schoolRoute = require("./routes/School/schoolRouter");
const teacherRoute = require("./routes/Teacher/teacherRouter");
const studentRoute = require("./routes/Student/studentRouter");
const videoRoute = require("./routes/streamRouter");
const assignmentsRoute = require("./routes/assignmentsRouter");
const stuAssignmentsRoute = require("./routes/Student/stuAssignmentRouter");
const downloadRouter = require("./routes/downloadRouter");
const recoveryRouter = require("./routes/recoveryRouter");
const setUser = require("./util/setUser");
const chimething = require("./routes/chimething");
const screenrec = require("./routes/screenrecRouter");
const cron = require("./util/scheduleCron");
require("dotenv").config();

const app = express();
//= =========================================================================
const port = process.env.PORT || 8000;
const notLoggedInValidator = require("./validation/notLoggedInValidator");
// const setUser = require('./util/setUser');
//= =========================================================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

cron();

const {
  userJoin,
  getCurrentUser,
  userLeaves,
  getRoomUsers,
  changeItem,
  getCurrentUserById,
  changeSpeech,
  changeAllSpeech,
  userLeavesName,
  changeAllMessages,
} = require("./util/users");
//= ========================================================================
const devCorsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const stgCorsOptions = {
  origin: /camcann\.com$/,
  credentials: true,
};

// if (process.env.NODE_ENV === "development") {
//   app.use(cors(devCorsOptions));
// } else {
//   app.use(cors(stgCorsOptions));
// }
app.use(cors(devCorsOptions));
//= =========================================================================

app.use("/downloadfile", downloadRouter);
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    name: process.env.SESS_NAME,
    secret: process.env.SESS_SECRET,
    store: new MongoStore({
      url: process.env.MONGO_URI,
      touchAfter: process.env.SESS_UPDATE_INTERVAL, // time period in seconds
    }),
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
//= =========================================================================
app.use("/auth", authRoutes);
app.use("/recovery", recoveryRouter);
app.use("/chime", chimething);
// app.use(notLoggedInValidator);
// app.use(setUser);
// app.use(express.static(process.env.FILE));
// ------: Other Protected Routers Here :-------
app.get("/current", (req, res) => res.json(req.user));
app.use("/videos", videoRoute);
app.use("/school", schoolRoute);
app.use("/teacher", teacherRoute);
app.use("/student", studentRoute);
app.use("/api", screenrec);
app.use("/teacher/assignment", assignmentsRoute);
app.use("/student/assignment", stuAssignmentsRoute);
// = =========================================================================
const server = http.createServer(app);

const io = socketio(server);
const RoomService = require("./RoomService")(io);

io.sockets.on("connection", RoomService.listen);
io.sockets.on("error", (e) => console.log(e));

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
  socket.on("joinroom", ({ username, room, type, allowed }) => {
    if (getCurrentUser(username) !== undefined) {
      userLeavesName(username);
    }
    const user = userJoin(socket.id, username, room, type, allowed);
    console.log(user);
    socket.join(user.room);

    //send user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    //welcome current user
    socket.emit("message", formatMessage("Chat Bot", "Welcome to chatcord")); //send to single client

    //user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Chat Bot", `${user.username} has joined the chat`)
      ); //send to all clients except the one connecting
    socket.on("changeArray", (username, changeTo) => {
      console.log(username);
      changeItem(username, changeTo);
      const user = getCurrentUser(username);
      if (user.allowed)
        socket
          .to(user.id)
          .emit(
            "message",
            formatMessage("Chatbot", "You can now send messages.")
          );
      else
        socket
          .to(user.id)
          .emit(
            "message",
            formatMessage(
              "Chatbot",
              "You are restricted from sending messages."
            )
          );
    });

    socket.on("changeAllSpeech", (changeTo) => {
      changeAllSpeech(changeTo);
      if (changeTo === true) {
        socket
          .to(user.room)
          .emit("message", formatMessage("Chatbot", "You can now speak."));
        socket.emit(
          "message",
          formatMessage("Chatbot", "Everyone can speak now.")
        );
      } else {
        socket
          .to(user.room)
          .emit(
            "message",
            formatMessage("Chatbot", "You are restricted from speaking.")
          );
        socket.emit(
          "message",
          formatMessage("Chatbot", "No one can speak now.")
        );
      }
    });

    socket.on("changeAllMessages", (changeTo) => {
      changeAllMessages(changeTo);
      if (changeTo === true) {
        socket
          .to(user.room)
          .emit(
            "message",
            formatMessage("Chatbot", "You can now send messages.")
          );
        socket.emit(
          "message",
          formatMessage("Chatbot", "Everyone can send messages now.")
        );
      } else {
        socket
          .to(user.room)
          .emit(
            "message",
            formatMessage(
              "Chatbot",
              "You are restricted from sending messages."
            )
          );
        socket.emit(
          "message",
          formatMessage("Chatbot", "No one can send messages now.")
        );
      }
    });

    socket.on("speakPermission", (username, changeTo) => {
      changeSpeech(username, changeTo);
      const user = getCurrentUser(username);
      if (user.speakAllowed)
        socket
          .to(user.id)
          .emit("message", formatMessage("Chatbot", "You can now speak."));
      else
        socket
          .to(user.id)
          .emit(
            "message",
            formatMessage("Chatbot", "You are restricted from speaking.")
          );
    });

    socket.on("removeRequest", (username) => {
      console.log(username);
      socket.broadcast.emit("removeChatRequest", username);
    });

    socket.on("requesting", (requestedBy) => {
      const users = getRoomUsers(user.room);
      users.map((user) => {
        if (user.type === "teacher") {
          socket
            .to(user.id)
            .emit(
              "message",
              formatMessage(
                "Chatbot",
                `${requestedBy} is requesting to send messages`
              )
            );
        }
      });
    });

    socket.on("requestingAudio", (requestedBy) => {
      const users = getRoomUsers(user.room);
      users.map((user) => {
        if (user.type === "teacher") {
          socket
            .to(user.id)
            .emit(
              "message",
              formatMessage("Chatbot", `${requestedBy} is requesting to speak`)
            );
        }
      });
    });
    socket.on("removePerson", (username) => {
      console.log(username);
      socket.broadcast.emit("removingPerson", username);
    });
  });

  //listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUserById(socket.id);
    if (user.allowed === true)
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    else {
      socket.emit(
        "message",
        formatMessage(
          "Chatbot",
          "You are not allowed to send messages. Please raise your hand from the button."
        )
      );
    }
  });

  //user disconnects
  socket.on("disconnecting", () => {
    const user = userLeaves(socket.id);
    if (user) {
      console.log(user);
      io.to(user.room).emit(
        "message",
        formatMessage("Chat Bot", `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  socket.on("end-audio-meeting", () => {
    const user = getCurrentUserById(socket.id);
    socket.broadcast.to(user.room).emit("stop-audio-meeting");
  });

  // io.emit() //send to everyone
});

// = =========================================================================
server.listen(port, () => console.log(`Server Online on port ${port}...`));
