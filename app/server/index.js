// server/index.js

const express = require("express");
const path = require("path");
const logger = require("./routes/logger");
const formatter = require("./routes/formatter");
const api = require("./routes/api");
const PORT = process.env.PORT || 3003;

const { Server } = require("socket.io");
const moment = require("moment");
const fetch = require("node-fetch");
const request = require("request");
let timestamp = moment().add(10, "seconds");
const helpers = require("./routes/helpers");

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = new Server(server);

app
  .use(express.static(path.resolve(__dirname, "../server/public")))
  .use(express.json())
  .use(logger)
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .set("json spaces", 2)
  .set("view engine", "ejs")
  .set("views", path.join(__dirname, "views"))
  .get("/", (req, res) => {
    res.render("../public/index");
  })
  .use("/api", api);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Websocket
let run;
io.on("connection", (socket) => {
  console.log("New client Connected!");

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    console.log("Client has Disconnected");
  });

  //send a timestamp to the socket
  socket.on("timestamp", function (msg) {
    console.log("on timestamp", msg);
  });

  socket.on("pausetimer", function (msg) {
    // run = false;
    // helpers
    //   .endTime(msg.requestOrigin, msg.userId)
    //   .then((e) => console.log("testtt", e));

    // pausetimer();
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        (runningTimerTrak[msg.userId].running = false),
      ]);
    }
    // runTimer(socket, timeFromNow(msg), msg);
    console.log("pausetimer", msg);
    // console.log("msg.userId", msg.userId);
    // console.log("msg.requestOrigin", msg.requestOrigin);
  });
  socket.on("playtimer", function (msg) {
    // run = true;
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        (runningTimerTrak[msg.userId].running = true),
      ]);
    }
    // runTimer(socket, timeFromNow(msg), msg);
    console.log("playtimer");
  });
  socket.on("resettimer", function (msg) {
    console.log("resettimer");
  });

  function sendAMessage(msg) {
    console.log("send a message:" + msg);
    socket.emit("message", `send a message ${msg}`);
  }
  function runTheTimer(msg, userID) {
    msg = msg.then((msg) => {
      return timeFromNow(msg);
    });
    console.log(`timestamp: request from user:${userID}`);
    run = true;
    runTimer(socket, msg, msg);
  }
  function joinRoom(userID) {
    socket.join(userID);
    console.log("Joined room:" + userID);
    socket.emit("message", `Joined a room: ${userID}`);
  }

  module.exports.sendAMessage = sendAMessage;
  module.exports.runTheTimer = runTheTimer;
  module.exports.joinRoom = joinRoom;
});
const runningTimerTrak = {};
const runTimer = async (socket, input, msg) => {
  socket.emit("message", "hello");
  const roomID = socket.handshake.headers.referer.split("/").pop();
  socket.on("disconnect", function () {
    const currentRoom = runningTimerTrak[roomID];
    // console.log(currentRoom);
    if (!currentRoom) return;
    currentRoom.clients.splice(currentRoom.clients.indexOf(socket), 1);
    // console.log(currentRoom);
  });
  // console.log("runningTimerTrak1", runningTimerTrak);
  // if (runningTimerTrak[roomID]) return;
  const param = await input;
  socket.emit("timestamp", formatter("run", "Loading...", param <= 0));
  if (runningTimerTrak[roomID] !== undefined) {
    runningTimerTrak[roomID].clients.push(socket);
    return;
  }
  runningTimerTrak[roomID] = {
    running: true,
    clients: [socket],
  };

  // console.log("runningTimerTrak2", runningTimerTrak);
  var ref;

  function longForLoop(param) {
    console.log("timeleft", param);
    var i = param;

    socket.emit("message", "running");
    socket.emit("message", run);

    // console.log(
    //   "message456",
    //   socket.handshake.headers.referer.split("/").pop()
    // );
    // console.log("message123", socket);

    if (param > 0) {
      ref = setInterval(() => {
        // console.log("i and rooomID", i, roomID);
        if (runningTimerTrak[roomID].running === true) {
          i--;
          runningTimerTrak[roomID].clients.forEach((s) => {
            s.emit("timestamp", formatter("run", secondsToHMS(i), false));
          });
          // socket.emit("message", run);
        } else {
          runningTimerTrak[roomID].clients.forEach(
            (s) => {
              s.emit("timestamp", formatter("paused", secondsToHMS(i), false));
            }
            // socket.emit("message", run);
          );
        }
        if (i <= 0) clearInterval(ref);
      }, 1000);
    }
  }

  // on pause
  // pause secs
  // start timer to count up
  //
  // on resume
  // collect counter from pause
  // add counter to end timer and write to db
  // continue timer (runTimer)
  //
  // if (run) {
  // run = true;
  input.then((result) => {
    longForLoop(result);
    // console.log("not paused/paused is false");
  });
  // }
  // else if (!run) {
  // run = false;
  // input.then((result) => {
  //   // longForLoop(-result);
  //   console.log("paused/paused is true");
  // });

  // pauseLoop(input);
  // console.log("paused/paused is true");
  // }
  // longForLoop(10);
};

// let secs;
const timeFromNow = async (timestamp) => {
  let secs;
  let time_now = moment();
  let duration = moment.duration(time_now.diff(timestamp));
  secs = Math.round(-duration.asSeconds());

  return secs;
};

//Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.dbURI_time);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.error("Connected to db"));

var secondsToHMS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};
