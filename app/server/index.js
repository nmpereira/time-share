// server/index.js

const express = require("express");
const path = require("path");
const logger = require("./routes/logger");
const api = require("./routes/api");
const PORT = process.env.PORT || 3001;
const app = express();
const moment = require("moment");
let timestamp = moment().add(10, "seconds");
let secs;
//Websocket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 7071 });
wss.on("connection", function connection(ws, req) {
  console.log("A new client Connected!");
  ws.send("Welcome New Client!");

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client has Disconnected");
  });
  runTimer(ws, timeFromNow(ws, timestamp));
  // timeFromNow(ws, timestamp);
  // console.log("timeFromNow", timeFromNow);
  // let seconds_left= timeFromNow(ws, timestamp)
});

const runTimer = async (ws, input) => {
  function longForLoop(secs) {
    var i = secs;
    var ref = setInterval(() => {
      ws.send(--i);
      if (i <= 0) clearInterval(ref);
    }, 1000);
  }

  longForLoop(secs);
};

const timeFromNow = async (ws, timestamp) => {
  // let timestamp = moment().add(2, "minutes");
  let time_now = moment();
  console.log("timestamp ", timestamp);
  console.log("time_now ", time_now);

  let duration = moment.duration(time_now.diff(timestamp));
  secs = Math.abs(duration.asSeconds());
  ws.send(secs);
  console.log(secs);
  // return secs;
};

//Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.dbURI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.error("Connected to db"));

//app config
app.set("json spaces", 2);
app.use(express.json());
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../server/public")));
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({
    message: "Timer App",
  });
});
app.use("/api", api);

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../server/public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
