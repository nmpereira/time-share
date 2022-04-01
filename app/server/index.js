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
const fetch = require("node-fetch");
const request = require("request");
let timestamp = moment().add(10, "seconds");

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
  let userID = req.params.id;

  let reqHost = req.headers.host;
  helpers.endTime(reqHost, userID).then((e) => {
    if (!e) {
      res.render("../public/error", {
        err_msg: "Timer not found! Please check the url!",
      });
    } else {
      try {
        res.render("../public/timeshare", { title: userID });
      } catch (err) {
        res.status(500).json({ msg: err.message });
      }

      setTimeout(() => {
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
  const userID = req.params.id;
  runningTimerTrak[userID].isBreak;
  var id = req.params.id;
  try {
    res.render("../public/resettimer", { userid: id, title: id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Update single Time by id
app.post("/reset/:id", async (req, res) => {
  console.log("req", req.body);
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

  if (req.body.isBreak !== undefined && req.body.isBreak == "1") {
    runningTimerTrak[userID].isBreak = true;
    console.log("paused?", runningTimerTrak[userID].isBreak);
  } else {
    console.log("Work Time");
    runningTimerTrak[userID].isBreak = false;
  }

  try {
    // TODO: fix this, seems like times isnt used
    const times = await time.findOneAndUpdate(query, update, {
      new: true,
    });

    res.redirect(`/${userID}`);

    clearInterval(runningTimerTrak[userID].interval);
    runningTimerTrak[userID].interval = null;
    setTimeout(() => {
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

//Websocket
let clientsConnected_Global = 0;
const runningTimerTrak = {};
io.on("connection", (socket) => {
  const roomID = socket.handshake.headers.referer.split("/").pop();

  socket.join(roomID);

  if (runningTimerTrak[roomID] == undefined) {
    runningTimerTrak[roomID] = {
      clients: [],
      connections: 1,
    };
  }

  setTimeout(() => {
    runningTimerTrak[roomID].connections = liveClientCount(roomID);

    io.to(roomID).emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Left",
      roomID,
    });
  }, 200);
  if (runningTimerTrak[roomID].connections == 0) {
    // Adding First Client
    runningTimerTrak[roomID].connections += 1;
  }
  clientsConnected_Global += 1;
  io.emit("userActivity", {
    clientsConnected_Global,
    Activity: "Client Joined",
  });

  roomID != ""
    ? console.log(
        `New client Connected! Room ID: ${roomID} Clients connected: ${runningTimerTrak[roomID].connections}`
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
        ? `Client has Disconnected from:  ${roomID} due to ${reason}! Clients left: ${runningTimerTrak[roomID].connections}`
        : "Client has Disconnected"
    );
    setTimeout(() => {
      runningTimerTrak[roomID].connections = liveClientCount(roomID);

      io.to(roomID).emit("localUserActivity", {
        clientsConnected_Socket: runningTimerTrak[roomID].connections,
        Activity: "Socket Client Left",
        roomID,
      });
    }, 200);
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
        `paused: ${(runningTimerTrak[msg.userId].running = false)}`,
      ]);
    }
  });
  socket.on("playtimer", function (msg) {
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        `paused: ${(runningTimerTrak[msg.userId].running = true)}`,
      ]);
    }
  });
  socket.on("resettimer", function (msg) {});

  function sendAMessage(msg) {
    console.log("send a message:" + msg);
    socket.emit("message", `send a message ${msg}`);
  }
  function runTheTimer(msg, userID) {
    msg = msg.then((msg) => {
      return timeFromNow(msg);
    });

    runTimer(socket, msg, msg);
  }

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
const runTimer = async (socket, input, msg) => {
  let reset;

  const clientsConnected_Socket = 0;
  socket.emit("message", "Greetings Earthling");
  const roomID = socket.handshake.headers.referer.split("/").pop();

  socket.on("disconnect", function () {
    const currentRoom = runningTimerTrak[roomID];

    if (!currentRoom) return;
    // NOTE: find index of room and return if not found
    const socket_index = currentRoom.clients.indexOf(socket);

    if (socket_index == -1) {
      return;
    }

    currentRoom.clients.splice(socket_index, 1);

    setTimeout(() => {
      runningTimerTrak[roomID].connections = liveClientCount(roomID);
      io.to(roomID).emit("localUserActivity", {
        clientsConnected_Socket: runningTimerTrak[roomID].connections,
        Activity: "Socket Client Left",
        roomID,
      });
    }, 200);

    setTimeout(() => {
      if (!runningTimerTrak[roomID].connections > 0) {
        clearInterval(runningTimerTrak[roomID].interval);
        runningTimerTrak[roomID].interval = null;
        console.log(
          `#################### Clearing# ${roomID} #########################`
        );
      }
    }, 2000);
  });

  const param = await input;
  socket.emit(
    "timestamp",
    formatter("Loading", secondsToHMS(param), param <= 0, false)
  );
  // NOTE: if exists or if interval is running
  if (
    runningTimerTrak[roomID] !== undefined &&
    runningTimerTrak[roomID].interval != null
  ) {
    runningTimerTrak[roomID].clients.push(socket);
    // runningTimerTrak[roomID].connections += 1;
    io.to(roomID).emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Joined",
      roomID,
    });

    return;
  }

  if (
    runningTimerTrak[roomID] == undefined ||
    runningTimerTrak[roomID].clients.length == 0
  ) {
    runningTimerTrak[roomID] = {
      running: true,
      clients: [socket],
      connections: 1,
      interval: null,
      isBreak: false,
    };
  }

  io.to(roomID).emit("localUserActivity", {
    clientsConnected_Socket: runningTimerTrak[roomID].connections,
    Activity: "User Joined new room",
    roomID,
  });

  function longForLoop(param) {
    let delay;
    var i = param;

    if (param > 0) {
      runningTimerTrak[roomID].interval = setInterval(() => {
        if (runningTimerTrak[roomID].connections < 1) {
          console.log(
            `Timer ${roomID} has ${runningTimerTrak[roomID].connections} connections, stopping...`
          );
        }

        if (runningTimerTrak[roomID].running === true) {
          i--;
          runningTimerTrak[roomID].clients.forEach((s) => {
            s.emit(
              "timestamp",
              formatter(
                "run",
                secondsToHMS(i),
                false,
                runningTimerTrak[roomID].isBreak
              )
            );
          });
        } else {
          runningTimerTrak[roomID].clients.forEach((s) => {
            s.emit(
              "timestamp",
              formatter(
                "paused",
                secondsToHMS(i),
                false,
                runningTimerTrak[roomID].isBreak
              )
            );
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
