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
// const runATimer = require("runTheTimer");
// const joinARoom = require("joinRoom");
const joinARoom = require("./index.js");
const runATimer = require("./index.js");
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
  .set("trust proxy", true)
  .get("/", (req, res) => {
    res.render("../public/index");
  })
  .use("/api", api);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
//Get single Time by id
app.get("/:id", async (req, res) => {
  try {
    res.render("../public/timeshare");
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }

  let userID = req.params.id;
  let reqHost = req.headers.host;

  setTimeout(() => {
    joinARoom.joinRoom(userID);
    runATimer.runTheTimer(
      helpers.endTime(reqHost, userID).then((e) => {
        return e;
      }),
      userID
    );
  }, 500);
});
//Websocket
let clientsConnected_Global = 0;
let run;
io.on("connection", (socket) => {
  console.log("New client Connected!");

  clientsConnected_Global += 1;
  io.emit("userActivity", {
    clientsConnected_Global,
    Activity: "Client Joined",
  });
  console.log("Global Connections", clientsConnected_Global);

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    clientsConnected_Global -= 1;
    io.emit("userActivity", {
      clientsConnected_Global,
      Activity: "Client Left",
    });
    console.log("Global Connections", clientsConnected_Global);

    console.log("Client has Disconnected");
  });

  //send a timestamp to the socket
  socket.on("timestamp", function (msg) {
    console.log("on timestamp", msg);
  });

  socket.on("pausetimer", function (msg) {
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        (runningTimerTrak[msg.userId].running = false),
      ]);
    }
    console.log("pausetimer", msg);
  });
  socket.on("playtimer", function (msg) {
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        (runningTimerTrak[msg.userId].running = true),
      ]);
    }
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
    // run = true;
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
  const clientsConnected_Socket = 0;
  socket.emit("message", "Greetings Earthling");
  const roomID = socket.handshake.headers.referer.split("/").pop();

  // console.log(runningTimerTrak[roomID].clients.length);
  socket.on("connection", function () {});
  socket.on("disconnect", function () {
    const currentRoom = runningTimerTrak[roomID];

    if (!currentRoom) return;
    currentRoom.clients.splice(currentRoom.clients.indexOf(socket), 1);
    runningTimerTrak[roomID].connections -= 1;
    io.emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Left",
    });
    console.log("Local Connections", runningTimerTrak[roomID].connections);
  });
  // console.log("runningTimerTrak1", runningTimerTrak);
  // if (runningTimerTrak[roomID]) return;
  const param = await input;
  socket.emit("timestamp", formatter("run", secondsToHMS(param), param <= 0));
  if (runningTimerTrak[roomID] !== undefined) {
    runningTimerTrak[roomID].clients.push(socket);
    runningTimerTrak[roomID].connections += 1;
    io.emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Joined",
    });
    console.log("Local Connections", runningTimerTrak[roomID].connections);
    return;
  }
  runningTimerTrak[roomID] = {
    running: true,
    clients: [socket],
    connections: 1,
  };
  io.emit("localUserActivity", {
    clientsConnected_Socket: runningTimerTrak[roomID].connections,
    Activity: "User Joined new room",
  });
  console.log("Local Connections", runningTimerTrak[roomID].connections);

  // console.log("runningTimerTrak2", runningTimerTrak);
  var ref;

  function longForLoop(param) {
    console.log("timeleft", param);
    var i = param;

    if (param > 0) {
      ref = setInterval(() => {
        // console.log("i and rooomID", i, roomID);
        if (runningTimerTrak[roomID].running === true) {
          i--;
          runningTimerTrak[roomID].clients.forEach((s) => {
            s.emit("timestamp", formatter("run", secondsToHMS(i), false));
          });
        } else {
          runningTimerTrak[roomID].clients.forEach((s) => {
            s.emit("timestamp", formatter("paused", secondsToHMS(i), false));
          });
        }
        if (i <= 0) clearInterval(ref);
      }, 1000);
    }
  }

  input.then((result) => {
    longForLoop(result);
  });
};

// let secs;
const timeFromNow = async (timestamp) => {
  let secs;
  let time_now = moment();
  let duration = moment.duration(time_now.diff(timestamp));
  secs = Math.round(-duration.asSeconds());
  secs > 0 ? secs : (secs = 0);
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
  if (secs > 0) {
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  } else return 0;
};
