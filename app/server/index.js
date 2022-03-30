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
// const joinARoom = require("./index.js");
const runATimer = require("./index.js");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = new Server(server);
const methodOverride = require("method-override");
const time = require("../server/models/time");

app
  .use(express.static(path.resolve(__dirname, "../server/public")))
  .use(express.json())
  .use(logger)
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(methodOverride("_method"))
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
  let userID = req.params.id;
  let reqHost = req.headers.host;
  helpers.endTime(reqHost, userID).then((e) => {
    if (!e) {
      res.render("../public/error");
    } else {
      try {
        res.render("../public/timeshare");
      } catch (err) {
        res.status(500).json({ msg: err.message });
      }

      setTimeout(() => {
        // joinARoom.joinRoom(userID);
        runATimer.runTheTimer(
          helpers.endTime(reqHost, userID).then((e) => {
            return e;
          }),
          userID
        );
      }, 500);
    }
  });
});
app.get("/reset/:id", async (req, res) => {
  var id = req.params.id;
  try {
    res.render("../public/resettimer", { userid: id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Update single Time by id
app.post("/reset/:id", async (req, res) => {
  // console.log("abc");
  const userID = req.params.id;
  let reqHost = req.headers.host;
  const query = { user: req.params.id };
  const updated_at = Date.now();
  const update = {
    $set: {
      user: req.body.user,
      num_work: req.body.num_work,
      time_work: req.body.time_work,
      num_break: req.body.num_break,
      time_break: req.body.time_break,
      sets: req.body.sets,
      end_time: req.body.end_time,
      paused: req.body.paused,
    },
    updated_at,
  };

  try {
    const times = await time.findOneAndUpdate(query, update, {
      new: true,
    });

    // res.send(times);
    res.redirect(`/${userID}`);

    clearInterval(runningTimerTrak[userID].interval);
    runningTimerTrak[userID].interval = null;
    setTimeout(() => {
      // joinARoom.joinRoom(userID);
      runATimer.runTheTimer(
        helpers.endTime(reqHost, userID).then((e) => {
          return e;
        }),
        userID
      );
    }, 500);
  } catch (err) {
    res.status(500).json({ msg1: err.message });
    console.log(err);
  }
});
// app.put("/reset/:id", async (req, res) => {
//   console.log("def");
//   // var userid = req.body.userid;
//   // var endtime = req.body.endtime;
//   console.log("inputs:");
//   // const query = { user: req.params.id };
//   // const updated_at = Date.now();
//   // const update = {
//   //   $set: {
//   //     user: req.body.user,
//   //     num_work: req.body.num_work,
//   //     time_work: req.body.time_work,
//   //     num_break: req.body.num_break,
//   //     time_break: req.body.time_break,
//   //     sets: req.body.sets,
//   //     end_time: req.body.end_time,
//   //     paused: req.body.paused,
//   //   },
//   //   updated_at,
//   // };

//   // try {
//   //   const times = await time.findOneAndUpdate(query, update, {
//   //     new: true,
//   //   });
//   //   res.send(times);
//   // } catch (err) {
//   //   res.status(500).json({ msg1: err.message });
//   // }
// });

//Websocket
let clientsConnected_Global = 0;
let run;
io.on("connection", (socket) => {
  const roomID = socket.handshake.headers.referer.split("/").pop();
  console.log("New client Connected!", "Room ID:", roomID);

  socket.join(roomID);

  clientsConnected_Global += 1;
  io.emit("userActivity", {
    clientsConnected_Global,
    Activity: "Client Joined",
  });
  // console.log("Global Connections", clientsConnected_Global);

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function (reason) {
    clientsConnected_Global -= 1;
    io.emit("userActivity", {
      clientsConnected_Global,
      Activity: "Client Left",
    });
    // console.log("Global Connections", clientsConnected_Global);

    console.log(
      reason
        ? `Client has Disconnected from:  ${roomID} due to ${reason}`
        : "Client has Disconnected"
    );
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
    // console.log("pausetimer", msg);
  });
  socket.on("playtimer", function (msg) {
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        (runningTimerTrak[msg.userId].running = true),
      ]);
    }
    // console.log("playtimer");
  });
  socket.on("resettimer", function (msg) {
    // let reset;
    // runningTimerTrak[reset] = true;
    // console.log("resettimer", runningTimerTrak[reset]);
  });

  function sendAMessage(msg) {
    console.log("send a message:" + msg);
    socket.emit("message", `send a message ${msg}`);
  }
  function runTheTimer(msg, userID) {
    msg = msg.then((msg) => {
      return timeFromNow(msg);
    });
    // console.log(`timestamp: request from user:${userID}`);
    // run = true;
    runTimer(socket, msg, msg);
  }
  // function joinRoom(userID) {
  //   socket.join(userID);
  //   console.log("Joined room:" + userID);
  //   socket.emit("message", `Joined a room: ${userID}`);
  // }

  module.exports.sendAMessage = sendAMessage;
  module.exports.runTheTimer = runTheTimer;
  // module.exports.joinRoom = joinRoom;
});
const runningTimerTrak = {};
const runTimer = async (socket, input, msg) => {
  // var ref;
  // clearInterval(ref);
  let reset;
  // console.log("you are in runTimer");
  const clientsConnected_Socket = 0;
  socket.emit("message", "Greetings Earthling");
  const roomID = socket.handshake.headers.referer.split("/").pop();

  // console.log(runningTimerTrak[roomID].clients.length);
  socket.on("connection", function () {});
  socket.on("disconnect", function () {
    const currentRoom = runningTimerTrak[roomID];

    if (!currentRoom) return;
    // NOTE: find index of room and return if not found
    const socket_index = currentRoom.clients.indexOf(socket);
    if (socket_index == -1) return;
    // console.log("socket_index_1", socket_index);
    currentRoom.clients.splice(socket_index, 1);

    runningTimerTrak[roomID].connections -= 1;
    io.to(roomID).emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Left",
      roomID,
    });
    // console.log("Local Connections", runningTimerTrak[roomID].connections);
  });
  // console.log("runningTimerTrak1", runningTimerTrak);
  // if (runningTimerTrak[roomID]) return;
  const param = await input;
  socket.emit("timestamp", formatter("Loading", "Loading...", param <= 0));
  // NOTE: if exists or if interval is running
  if (
    runningTimerTrak[roomID] !== undefined &&
    runningTimerTrak[roomID].interval != null
  ) {
    runningTimerTrak[roomID].clients.push(socket);
    runningTimerTrak[roomID].connections += 1;
    io.to(roomID).emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Joined",
      roomID,
    });

    // console.log(
    //   "Local Connections",
    //   runningTimerTrak[roomID].connections,
    //   roomID
    // );
    // console.log("you are in if Notundefined");
    // NOTE: i am here. I need to add a property to an object "reset:true" and make sure it doesnt return here but goes and runs timer
    return;
  }
  // console.log("runningTimerTrak[roomID]_1", runningTimerTrak[roomID]);
  if (runningTimerTrak[roomID] == undefined) {
    runningTimerTrak[roomID] = {
      running: true,
      clients: [socket],
      connections: 1,
      interval: null,
    };
  }
  // console.log("runningTimerTrak[roomID]_2", runningTimerTrak[roomID]);
  io.to(roomID).emit("localUserActivity", {
    clientsConnected_Socket: runningTimerTrak[roomID].connections,
    Activity: "User Joined new room",
    roomID,
  });
  // console.log("Local Connections", runningTimerTrak[roomID].connections);

  // console.log("runningTimerTrak2", runningTimerTrak);
  // var ref;

  // add the interval (ref) to the room obj (runningTimerTrak[roomID])
  //

  //
  function longForLoop(param) {
    // console.log("timeleft", param);
    var i = param;

    if (param > 0) {
      runningTimerTrak[roomID].interval = setInterval(() => {
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
        if (i <= 0) clearInterval(runningTimerTrak[roomID].interval);
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
