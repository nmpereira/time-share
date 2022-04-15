// server/index.js

const express = require("express");
const path = require("path");
const logger = require("./routes/logger");
const formatter = require("./routes/formatter");
const api = require("./routes/api");
const PORT = process.env.PORT || 3003;
const bodyParser = require("body-parser");

const { Server } = require("socket.io");
const moment = require("moment");
// const fetch = require("node-fetch");
// const request = require("request");
// let timestamp = moment().add(10, "seconds");

const helpers = require("./routes/helpers");
// const admin = require("./routes/admin");

const runATimer = require("./index.js");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, { pingTimeout: 5000 });
const methodOverride = require("method-override");
const time = require("../server/models/time");
const session = require("express-session");
// const MemoryStore = require("memorystore")(session);
// var MongoDbStore = require("connect-mongo");
const mongoose = require("mongoose");
const NODE_ENV = process.env.NODE_ENV || "Local";

app
  .use(
    session({
      cookie: { maxAge: 60000 },
      resave: true,
      saveUninitialized: true,
      // store: MongoDbStore.create({
      //   mongoUrl: process.env.dbURI_time,
      //   checkPeriod: 86400000, // prune expired entries every 24h
      // }),

      secret: "keyboard cat",
    })
  )
  .use(express.static(path.resolve(__dirname, "../server/public")))
  // .use("/admin", admin)

  .use(bodyParser.json())
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

console.log("Env:", NODE_ENV);
//Get single Time by id
app.get("/:id", async (req, res) => {
  let roomID = req.params.id;

  let host = req.headers.host;
  // console.log("timer_data[roomID].workCounter", timer_data[roomID]);
  // helpers.endTime(host, roomID).then((e) => {
  //   if (!e) {
  //     res.render("../public/error", {
  //       err_msg: "Timer not found! Please check the url!",
  //     });
  //   } else {

  readFromDb(roomID).then((x) => {
    (timer_data[roomID].breakCounter = x?.break_count),
      (timer_data[roomID].workCounter = x?.pomo_count);
    // console.log(
    //   "readFromDb 1",
    //   "work",
    //   timer_data[roomID].workCounter,
    //   "break",
    //   timer_data[roomID].breakCounter
    // );
  });
  if (
    timer_data[roomID] != undefined ||
    timer_data[roomID]?.workCounter !== undefined
  ) {
    io.to(roomID).emit("pomocount", {
      workCounter: timer_data[roomID].workCounter,
      breakCounter: timer_data[roomID].breakCounter,

      Activity: "pomo count updated_4!",
      roomID,
    });
  }

  if (
    timer_data[roomID] == undefined ||
    timer_data[roomID].workCounter == undefined
  ) {
    timer_data[roomID] = {
      workCounter: 0,
      breakCounter: 0,
    };
    // writeToDb(
    //   roomID,
    //   timer_data[roomID].workCounter,
    //   timer_data[roomID].breakCounter
    // );
  }

  // console.log("timer_data[roomID].workCounter", timer_data[roomID]);
  try {
    if (
      timer_data[roomID].workCounter != undefined ||
      timer_data[roomID].workCounter == 0
    ) {
      res.render("../public/timeshare", {
        title: roomID,
        workCounter: timer_data[roomID].workCounter,
      });
    } else {
      res.render("../public/timeshare", {
        title: roomID,
      });
    }
    if (
      timer_data[roomID] != undefined ||
      timer_data[roomID]?.workCounter !== undefined
    ) {
      io.to(roomID).emit("pomocount", {
        workCounter: timer_data[roomID].workCounter,
        breakCounter: timer_data[roomID].breakCounter,

        Activity: "pomo count updated_1!",
        roomID,
      });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }

  try {
    setTimeout(() => {
      runATimer.runTheTimer(
        helpers.endTime(host, roomID).then((e) => {
          return e;
        }),
        roomID,
        req
      );
    }, 500);
  } catch (err) {
    console.log(
      "###########################################runTimer Failed:",
      err
    );
    setTimeout(() => {
      console.log("waiting");
      setTimeout(() => {
        runATimer.runTheTimer(
          helpers.endTime(host, roomID).then((e) => {
            return e;
          }),
          roomID,
          req
        );
      }, 500);
    }, 1000);
  }
  // console.log("host", host);
  // }
  // });
});
app.get("/reset/:id", async (req, res) => {
  const roomID = req.params.id;
  // timer_data[roomID].isBreak;
  var id = req.params.id;
  try {
    res.render("../public/resettimer", { userid: id, title: id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Update single Time by id
app.post("/reset/:id", async (req, res) => {
  const roomID = req.params.id;
  let host = req.headers.host;
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
      pomo_count: req.body.pomo_count,
      break_count: req.body.break_count,
      end_time: req.body.end_time,
      paused: req.body.paused,
    },
    updated_at,
  };

  // here
  if (timer_data[roomID].isBreak == undefined) {
    timer_data[roomID].isBreak = false;
  }
  if (req.body.isBreak !== undefined && req.body.isBreak == "1") {
    // console.log("break params 1", req.body.isBreak);
    timer_data[roomID].isBreak = true;
  } else {
    // console.log("Work Time");
    // console.log("break params 2", req.body.isBreak || "not found");
    timer_data[roomID].isBreak = false;
  }

  try {
    // TODO: fix this, seems like times isnt used
    const times = await time.findOneAndUpdate(query, update, {
      new: true,
    });

    res.redirect(`/${roomID}`);

    clearInterval(timer_data[roomID].interval);
    timer_data[roomID].interval = null;
    // console.log("host", host);
    setTimeout(() => {
      runATimer.runTheTimer(
        helpers.endTime(host, roomID).then((e) => {
          return e;
        }),
        roomID,
        req
      );
    }, 500);
  } catch (err) {
    res.status(500).json({ msg: err.message });
    console.log(err);
  }
});
const readFromDb = async (_roomID) => {
  return await time.findOne({ user: _roomID });
};

const writeToDb = async (_roomID, pomo_count, break_count) => {
  const query = { user: _roomID };
  const updated_at = Date.now();
  const update = {
    $set: {
      user: _roomID,
      pomo_count,
      break_count,
    },
    updated_at,
  };
  try {
    const times = await time.findOneAndUpdate(query, update, {
      upsert: true,
    });
    // console.log({ "Writing to db": times });
  } catch (err) {
    console.log({ msg: err.message });
  }
};

//Websocket
let clientsConnected_Global = 0;
const timer_data = {};
io.on("connection", (socket) => {
  const roomID = socket.handshake.headers.referer.split("/").pop();
  const host = socket.handshake.headers.host;
  // console.log("host", host);

  readFromDb(roomID).then((x) => {
    (timer_data[roomID].breakCounter = x?.break_count || 0),
      (timer_data[roomID].workCounter = x?.pomo_count || 0);
    // console.log(
    //   "readFromDb 2",
    //   "work",
    //   timer_data[roomID].workCounter,
    //   "break",
    //   timer_data[roomID].breakCounter
    // );
  });
  if (
    timer_data[roomID] != undefined ||
    timer_data[roomID]?.workCounter != undefined
  ) {
    socket.join(roomID);
    io.to(roomID).emit("pomocount", {
      workCounter: timer_data[roomID].workCounter,
      breakCounter: timer_data[roomID].breakCounter,

      Activity: "pomo count updated!",
      roomID,
    });
  }

  if (timer_data[roomID] == undefined) {
    timer_data[roomID] = {
      clients: [],
      connections: 1,
      isBreak: false,
      stoppedCounter: 0,
      running: true,
      isUpdateTimer: true,
      originalTime: 0,
      completedPercentage: 0,
      breakCounter: 0,
      workCounter: 0,
    };
    // writeToDb(
    //   roomID,
    //   timer_data[roomID].workCounter,
    //   timer_data[roomID].breakCounter
    // );
  }

  setTimeout(() => {
    timer_data[roomID].connections = liveClientCount(roomID);

    io.to(roomID).emit("localUserActivity", {
      // workCounter: timer_data[roomID].workCounter,
      // breakCounter: timer_data[roomID].breakCounter,
      clientsConnected_Socket: timer_data[roomID].connections,
      Activity: "Socket Client Joined_1",
      roomID,
    });
  }, 200);
  if (timer_data[roomID].connections == 0) {
    // Adding First Client
    timer_data[roomID].connections += 1;
  }
  clientsConnected_Global += 1;
  io.emit("userActivity", {
    clientsConnected_Global,
    Activity: "Client Joined",
  });

  roomID != ""
    ? console.log(
        `New client Connected! Room ID: ${roomID} Clients connected: ${timer_data[roomID].connections}`
      )
    : console.log("New client Connected!");

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function (reason) {
    clientsConnected_Global -= 1;
    io.emit("userActivity", {
      clientsConnected_Global,
      Activity: "Client Left",
    });

    console.log(
      reason
        ? `Client has Disconnected from:  ${roomID} due to ${reason}! Clients left: ${timer_data[roomID].connections}`
        : "Client has Disconnected"
    );
    setTimeout(() => {
      timer_data[roomID].connections = liveClientCount(roomID);

      io.to(roomID).emit("localUserActivity", {
        // workCounter: timer_data[roomID].workCounter,
        // breakCounter: timer_data[roomID].breakCounter,
        clientsConnected_Socket: timer_data[roomID].connections,
        Activity: "Socket Client Left_2",
        roomID,
      });
    }, 200);
  });

  //send a timestamp to the socket
  socket.on("timestamp", function (msg) {
    console.log("on timestamp", msg);
  });

  socket.on("pausetimer", function (msg) {
    const currentRoom = timer_data[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("timerActivity", [
        msg.userId,
        `paused: ${(timer_data[msg.userId].running = false)}`,
      ]);
    }
  });
  socket.on("playtimer", function (msg) {
    const currentRoom = timer_data[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("timerActivity", [
        msg.userId,
        `paused: ${(timer_data[msg.userId].running = true)}`,
      ]);
    }
  });
  socket.on("resettimer", function (msg) {});
  socket.on("changetimer", function (msg) {
    // timer_data[roomID].isUpdateTimer = true;
    if (timer_data[roomID].isUpdateTimer == true) {
      timer_data[roomID].isUpdateTimer = false;
    } else {
      timer_data[roomID].isUpdateTimer = true;
    }
    // console.log("updated isUpdateTimer to ", timer_data[roomID].isUpdateTimer);
    io.to(roomID).emit("changetimer", {
      isUpdateTimer: timer_data[roomID].isUpdateTimer,
    });
  });
  socket.on("addmin", function (msg) {
    clearInterval(timer_data[msg.userId].interval);

    if (msg.status == "work") {
      timer_data[roomID].isBreak = false;
    } else if (msg.status == "break") {
      timer_data[roomID].isBreak = true;
    } else {
      timer_data[roomID].isBreak = false;
    }
    longForLoop(minToSeconds(msg.min), msg.userId);
    minToSeconds(msg.min);

    // console.log(msg);
  });

  function sendAMessage(msg) {
    console.log("send a message:" + msg);
    socket.emit("message", `send a message ${msg}`);
  }
  function runTheTimer(msg, roomID, req) {
    msg = msg.then((msg) => {
      return timeFromNow(msg);
    });

    runTimer(socket, msg, req);
  }
  // this helps! DO NOT DELETE :) :)

  // runTheTimer(
  //   helpers.endTime(host, roomID).then((e) => {
  //     return e;
  //   }),
  //   roomID,
  //   { body: { a: "a" } }
  // );
  module.exports.sendAMessage = sendAMessage;
  module.exports.runTheTimer = runTheTimer;
});

const clientsInRoom = io.sockets.adapter.rooms;
let liveClientCount = (_roomID) => {
  if (
    typeof clientsInRoom.get(_roomID) != "object" ||
    clientsInRoom.get(_roomID).size == undefined
  ) {
    return 0;
  } else if (clientsInRoom.get(_roomID).size == 0) {
    return 1 + "shouldnt happen";
  } else {
    return clientsInRoom.get(_roomID).size;
  }
};
const runTimer = async (socket, input, req) => {
  // console.log("Run the timer");
  // console.log("socket", socket.id);
  // console.log("params", req.body);
  // input.then((x) => console.log("params2", x));
  // let reset;

  // const clientsConnected_Socket = 0;
  socket.emit("message", "Greetings Earthling");
  const roomID = socket.handshake.headers.referer.split("/").pop();

  socket.on("disconnect", function () {
    const currentRoom = timer_data[roomID];

    if (!currentRoom) return;
    // NOTE: find index of room and return if not found
    // const socket_index = currentRoom.clients.indexOf(socket);

    // if (socket_index == -1) {
    //   return;
    // }

    // currentRoom.clients.splice(socket_index, 1);

    setTimeout(() => {
      timer_data[roomID].connections = liveClientCount(roomID);
      io.to(roomID).emit("localUserActivity", {
        // workCounter: timer_data[roomID].workCounter,
        // breakCounter: timer_data[roomID].breakCounter,
        clientsConnected_Socket: timer_data[roomID].connections,
        Activity: "Socket Client Left_1",
        roomID,
      });
    }, 200);

    setTimeout(() => {
      if (!timer_data[roomID].connections > 0) {
        clearInterval(timer_data[roomID].interval);
        timer_data[roomID].interval = null;
        timer_data[roomID].stoppedCounter = 0;
        console.log(
          `#################### Clearing# ${roomID} #########################`
        );
      }
    }, 20000);
  });

  const param = await input;
  // console.log("timestamp socket emit1", param);
  // socket.emit(
  //   "timestamp",
  //   formatter(
  //     "Loading",
  //     "...",
  //     param <= 0,
  //     timer_data[roomID].isBreak,
  //     timer_data[roomID].isUpdateTimer
  //   )
  // );
  // NOTE: if exists or if interval is running
  if (timer_data[roomID] !== undefined && timer_data[roomID].interval != null) {
    // timer_data[roomID].clients.push(socket);
    timer_data[roomID].stoppedCounter = 0;
    // timer_data[roomID].connections += 1;
    io.to(roomID).emit("localUserActivity", {
      // workCounter: timer_data[roomID].workCounter,
      // breakCounter: timer_data[roomID].breakCounter,
      clientsConnected_Socket: timer_data[roomID].connections,
      Activity: "Socket Client Joined_2",
      roomID,
    });

    return;
  }
  if (
    timer_data[roomID] !== undefined &&
    timer_data[roomID].originalTime == undefined &&
    timer_data[roomID].completedPercentage == undefined
  ) {
    timer_data[roomID].originalTime = 0;
    timer_data[roomID].completedPercentage = 0;
  }
  if (
    timer_data[roomID] !== undefined &&
    timer_data[roomID].breakCounter == undefined &&
    timer_data[roomID].workCounter == undefined
  ) {
    timer_data[roomID].breakCounter = 0;
    timer_data[roomID].workCounter = 0;
    // writeToDb(
    //   roomID,
    //   timer_data[roomID].workCounter,
    //   timer_data[roomID].breakCounter
    // );
  }
  if (
    timer_data[roomID] == undefined
    // ||io.of(roomID).connected.size == 0
    // timer_data[roomID].clients.length == 0
  ) {
    timer_data[roomID] = {
      running: true,
      clients: [],
      connections: 1,
      interval: null,
      stoppedCounter: 0,
      isUpdateTimer: true,
      originalTime: 0,
      completedPercentage: 0,
      breakCounter: 0,
      workCounter: 0,
      // isBreak: false,
    };
    if (
      timer_data[roomID].isBreak == undefined &&
      req.body.isBreak !== undefined &&
      req.body.isBreak == "1"
    ) {
      // console.log("break params 3", req.body.isBreak || "not found");
      timer_data[roomID].isBreak = true;
    } else {
      // console.log("break params 4", req.body.isBreak || "not found");
      timer_data[roomID].isBreak = false;
    }
    // writeToDb(
    //   roomID,
    //   timer_data[roomID].workCounter,
    //   timer_data[roomID].breakCounter
    // );
  }

  io.to(roomID).emit("localUserActivity", {
    // workCounter: timer_data[roomID].workCounter,
    // breakCounter: timer_data[roomID].breakCounter,
    clientsConnected_Socket: timer_data[roomID].connections,
    Activity: "User Joined new room",
    roomID,
  });
  // console.log("timestamp socket emit2");

  // console.log("before long for loop input");
  input.then((result) => {
    longForLoop(result, roomID);
  });
};

function longForLoop(param, _roomID) {
  // let delay;
  var i = param;
  // console.log("this shit", timer_data[_roomID].originalTime);
  timer_data[_roomID].originalTime = param;
  readFromDb(_roomID).then((x) => {
    (timer_data[_roomID].breakCounter = x?.break_count || 0),
      (timer_data[_roomID].workCounter = x?.pomo_count || 0);
    // console.log(
    //   "readFromDb 2",
    //   "work",
    //   timer_data[_roomID].workCounter,
    //   "break",
    //   timer_data[_roomID].breakCounter
    // );
  });
  if (
    timer_data[_roomID] != undefined ||
    timer_data[_roomID].workCounter !== undefined
  ) {
    io.to(_roomID).emit("pomocount", {
      workCounter: timer_data[_roomID].workCounter,
      breakCounter: timer_data[_roomID].breakCounter,

      Activity: "pomo count updated_2!",
      _roomID,
    });
  }

  // console.log("this shit2", timer_data[_roomID].originalTime);
  if (param > 0) {
    timer_data[_roomID].interval = setInterval(() => {
      timer_data[_roomID].completedPercentage = computeCompleted(
        i,
        timer_data[_roomID].originalTime
      );
      if (timer_data[_roomID].connections < 1) {
        timer_data[_roomID].stoppedCounter++;

        // console.log(
        //   `Timer ${roomID} ha4 ${timer_data[roomID].connections} connections. Ran ${timer_data[roomID].stoppedCounter} times, Trying to stop...`
        // );
        if (timer_data[_roomID].stoppedCounter > 50) {
          clearInterval(timer_data[_roomID].interval);
          timer_data[_roomID].interval = null;
          timer_data[_roomID].stoppedCounter = 0;
          console.log(
            `#################### Cleared # ${_roomID} ######################### Timer ${_roomID} ha4 ${timer_data[_roomID].connections} connections. Ran ${timer_data[_roomID].stoppedCounter} times, Trying to stop...`
          );
        }
      }

      if (timer_data[_roomID].running === true) {
        i--;
        if (secondsToHMS(i) <= 0) {
          timer_data[_roomID].isUpdateTimer = true;
          timer_data[_roomID].isBreak
            ? timer_data[_roomID].breakCounter++
            : timer_data[_roomID].workCounter++;

          writeToDb(
            _roomID,
            timer_data[_roomID].workCounter,
            timer_data[_roomID].breakCounter
          );
          if (
            timer_data[_roomID] != undefined ||
            timer_data[_roomID].workCounter !== undefined
          ) {
            io.to(_roomID).emit("pomocount", {
              workCounter: timer_data[_roomID].workCounter,
              breakCounter: timer_data[_roomID].breakCounter,

              Activity: "pomo count updated_3!",
              _roomID,
            });
          }
        }
        io.to(_roomID).emit(
          "timestamp",
          formatter(
            "run",
            secondsToHMS(i),
            i <= 0,
            timer_data[_roomID].isBreak,
            timer_data[_roomID].isUpdateTimer,
            timer_data[_roomID].originalTime,
            timer_data[_roomID].completedPercentage
            // timer_data[_roomID].breakCounter,
            // timer_data[_roomID].workCounter
          )
        );
        // console.log(secondsToHMS(i), i);
        // timer_data[roomID].clients.forEach((s) => {
        // s.emit(

        // );
        // });
      } else {
        io.to(_roomID).emit(
          "timestamp",
          formatter(
            "paused",
            secondsToHMS(i),
            false,
            timer_data[_roomID].isBreak,
            timer_data[_roomID].isUpdateTimer,
            timer_data[_roomID].originalTime,
            timer_data[_roomID].completedPercentage
            // timer_data[_roomID].breakCounter,
            // timer_data[_roomID].workCounter
          )
        );
        // timer_data[_roomID].clients.forEach((s) => {
        // s.emit(
        // });
      }

      if (i <= 0) clearInterval(timer_data[_roomID].interval);
    }, 1000);
  }
}

const timeFromNow = async (timestamp) => {
  let secs;
  let time_now = moment();
  let duration = moment.duration(time_now.diff(timestamp));
  secs = Math.round(-duration.asSeconds());
  secs > 0 ? secs : (secs = 0);
  return secs;
};

//Mongoose
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
const minToSeconds = (min) => {
  if (Number(min) != min) return 0;
  if (min < 0 || min == "") return 0;
  return min * 60;
};

const computeCompleted = (numerator, denominator) => {
  let result = numerator / denominator;
  // console.log("####################", numerator);
  // console.log(result);
  if (result < 0.02) result = 0;
  // console.log("##############", result);
  return (100 - result * 100).toFixed(4);
};
