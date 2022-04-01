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
// const runATimer = require("runTheTimer");
// const joinARoom = require("joinRoom");
// const joinARoom = require("./index.js");
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
    // console.log("paused?", runningTimerTrak[userID].isBreak);
  } else {
    // console.log("Work Time");
    runningTimerTrak[userID].isBreak = false;
  }
  // console.log("req", req.body);
  // console.log("Break time", runningTimerTrak[userID].isBreak);
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
const runningTimerTrak = {};
io.on("connection", (socket) => {
  const roomID = socket.handshake.headers.referer.split("/").pop();

  console.log("New client Connected!", "Room ID:", roomID);

  socket.join(roomID);

  if (runningTimerTrak[roomID] == undefined) {
    runningTimerTrak[roomID] = {
      clients: [],
      connections: 1,
    };
  }

  setTimeout(() => {
    runningTimerTrak[roomID].connections = liveClientCount(roomID);
    console.log("connected:", liveClientCount(roomID));
    io.to(roomID).emit("localUserActivity", {
      clientsConnected_Socket: runningTimerTrak[roomID].connections,
      Activity: "Socket Client Left",
      roomID,
    });
  }, 200);
  if (runningTimerTrak[roomID].connections == 0) {
    console.log("adding 1st client");
    runningTimerTrak[roomID].connections += 1;
  }
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
    setTimeout(() => {
      runningTimerTrak[roomID].connections = liveClientCount(roomID);
      console.log("connected:", liveClientCount(roomID));
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
    // console.log("pausetimer", msg);
  });
  socket.on("playtimer", function (msg) {
    const currentRoom = runningTimerTrak[msg.userId];
    if (currentRoom) {
      io.to(msg.userId).emit("message", [
        msg.userId,
        `paused: ${(runningTimerTrak[msg.userId].running = true)}`,
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

const clientsInRoom = io.sockets.adapter.rooms;
let liveClientCount = (_roomID) => {
  if (
    typeof clientsInRoom.get(_roomID) != "object" ||
    clientsInRoom.get(_roomID).size == undefined
  ) {
    // console.log("2", clientsInRoom.get(_roomID));
    return 0;
  } else if (clientsInRoom.get(_roomID).size == 0) {
    return 1 + "shouldnt happen";
  } else {
    return clientsInRoom.get(_roomID).size;
  }
};
const runTimer = async (socket, input, msg) => {
  console.log("we are in runtimer######################");
  // var ref;
  // clearInterval(ref);
  let reset;
  // console.log("you are in runTimer");
  const clientsConnected_Socket = 0;
  socket.emit("message", "Greetings Earthling");
  const roomID = socket.handshake.headers.referer.split("/").pop();

  // console.log(runningTimerTrak[roomID].clients.length);
  // socket.on("connection", function () {
  //   // console.log("liveClientCount(roomID)2", liveClientCount(roomID));
  // });
  socket.on("disconnect", function () {
    const currentRoom = runningTimerTrak[roomID];

    if (!currentRoom) return;
    // NOTE: find index of room and return if not found
    const socket_index = currentRoom.clients.indexOf(socket);
    // console.log("currentRoom.clients1", currentRoom.clients.length);
    // console.log("socket_index", socket_index);
    // const socketPop = runningTimerTrak[roomID].clients.find(
    //   (x) => socket_index
    // );
    // console.log("socketPop", socketPop);
    if (socket_index == -1) {
      // runningTimerTrak[roomID].connections -= 1;
      return;
    }
    // console.log("socket_index_1", socket_index);
    currentRoom.clients.splice(socket_index, 1);

    // const clientsInRoom = async () => await io.in(roomID).fetchSockets();
    // clientsInRoom().then((x) => console.log("clientsInRoom", x));
    // console.log("clientsInRoom11", io.sockets.adapter);
    // console.log("clientsInRoom", clientsInRoom);
    // console.log("clientsInRoom1", clientsInRoom[roomID]);
    // console.log("clientsInRoom2", clientsInRoom.length);
    // console.log("clientsInRoom3", clientsInRoom.get(roomID));
    // console.log("5", io.of(roomID).adapter);
    // console.log("clientsInRoom4", clientsInRoom.get(roomID).size);
    // when
    /* 



*/
    // when 1
    /* 
true


*/
    // when 2+

    /* 

    
    
    */
    setTimeout(() => {
      runningTimerTrak[roomID].connections = liveClientCount(roomID);
      io.to(roomID).emit("localUserActivity", {
        clientsConnected_Socket: runningTimerTrak[roomID].connections,
        Activity: "Socket Client Left",
        roomID,
      });
    }, 200);
    console.log("disconnected:", liveClientCount(roomID));
    // console.log("3", io.of(roomID).allSockets());
    // io.in(roomID)
    //   .allSockets()
    //   .then((x) => console.log("4", x));
    // .then((x) => console.log("liveClientCount(roomID)", x));
    // setTimeout(() => {
    //   console.log("liveClientCount", liveClientCount(roomID));
    //   // const liveClientCount =
    //   //   typeof clientsInRoom.get(roomID) != "object" ||
    //   //   clientsInRoom.get(roomID).size == undefined ||
    //   //   clientsInRoom.get(roomID).size == 0
    //   //     ? "zero"
    //   //     : clientsInRoom.get(roomID).size + 1;
    //   console.log("1", clientsInRoom);

    //   console.log("3", io.of(roomID).allSockets());
    //   io.in(roomID)
    //     .allSockets()
    //     .then((x) => console.log("4", x));
    // }, 500);

    // const abc = liveClientCount().then((x) => {
    //   return;
    // });
    // console.log("liveClientCount",  liveClientCount());

    // console.log("1", typeof clientsInRoom.get(roomID) != "object");

    // console.log("clientsInRoom5", Object.values(clientsInRoom.get(roomID)));
    // console.log("clientsInRoom6", clientsInRoom.get(roomID).values());
    // let arr = [];
    // clientsInRoom.get(roomID).forEach((x) => arr.push(x));
    // console.log("clientsInRoom7", arr);
    // console.log("clientsInRoom8", clientsInRoom.get(roomID).entries());
    // console.log("currentRoom.clients2", currentRoom.clients.length);
    // console.log(
    //   "runningTimerTrak[roomID].connections",
    //   runningTimerTrak[roomID].connections
    // );
    // runningTimerTrak[roomID].connections -= 1;

    // console.log("Local Connections", runningTimerTrak[roomID].connections);
  });
  // console.log("runningTimerTrak1", runningTimerTrak);
  // if (runningTimerTrak[roomID]) return;
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

    // console.log(
    //   "Local Connections",
    //   runningTimerTrak[roomID].connections,
    //   roomID
    // );
    console.log("you are in if Notundefined####################");
    // NOTE: i am here. I need to add a property to an object "reset:true" and make sure it doesnt return here but goes and runs  timer
    return;
  }
  // console.log("runningTimerTrak[roomID]_1", runningTimerTrak[roomID]);
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
  console.log("we are before longForLoop######################");
  function longForLoop(param) {
    console.log("we are in longForLoop######################");
    let delay;
    // console.log("timeleft", param);
    var i = param;

    if (param > 0) {
      runningTimerTrak[roomID].interval = setInterval(() => {
        setTimeout(() => {
          console.log("how long is this taking##########################");
          if (runningTimerTrak[roomID].connections > 0) {
            console.log(
              "clients",
              runningTimerTrak[roomID].connections,
              true,
              roomID
            );
          } else {
            clearInterval(runningTimerTrak[roomID].interval);
            console.log(
              "####################Clearing##########################"
            );
          }
        }, 2000);
        console.log(
          "connections in this loop",
          runningTimerTrak[roomID].connections
        );
        // console.log("paused..?", runningTimerTrak[roomID].isBreak);
        // console.log(
        //   "connections..?",
        //   runningTimerTrak[roomID].connections,
        //   typeof runningTimerTrak[roomID].connections
        // );
        // console.log("i and rooomID", i, roomID);
        console.log(
          "we before running=true",
          runningTimerTrak[roomID].running
          // runningTimerTrak[roomID].clients.id
        );
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
        // const currentConnections = runningTimerTrak[roomID].connections;

        // setTimeout(
        //   () =>
        //     (delay =
        //       currentConnections + 1 - runningTimerTrak[roomID].connections),
        //   5000
        // );
        // console.log("delay", delay);
        // console.log(
        //   "room size:",
        //   io.sockets.adapter.rooms.get(runningTimerTrak[roomID]).size
        // );

        // {
        //   if (runningTimerTrak[roomID].connections == 0) {
        //     console.log("trying to clear", roomID);
        //     clearInterval(runningTimerTrak[roomID].interval);
        //   }
        // }
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
