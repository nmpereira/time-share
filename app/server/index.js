// server/index.js

const express = require("express");
const path = require("path");
const logger = require("./routes/logger");
const api = require("./routes/api");
const PORT = process.env.PORT || 3001;

const { Server } = require("ws");
const moment = require("moment");
const fetch = require("node-fetch");
const request = require("request");
let timestamp = moment().add(10, "seconds");

const server = express()
  .use(express.static(path.resolve(__dirname, "../server/public")))
  .use(express.json())
  .use(logger)
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .set("json spaces", 2)
  .set("view engine", "ejs")
  .get("/", (req, res) => {
    res.render("../public/index");
  })
  .use("/api", api)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//Websocket
const WebSocket = require("ws");
const wss = new Server({ server, path: `/api/times/time/` });
wss.on("connection", async function connection(ws, req) {
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

  userID = "620c08c3da42f669fe201b0d";
  let query = `http://localhost:3001/api/times/${userID}`;
  const fetchtest = await fetch(query);
  const fetchData = await fetchtest.json();
  console.log(fetchData.end_time);
});

const runTimer = async (ws, input) => {
  function longForLoop(secs) {
    var i = secs;
    if (secs > 0) {
      var ref = setInterval(() => {
        ws.send(--i);

        if (i <= 0) clearInterval(ref);
      }, 1000);
    }
  }

  longForLoop(secs);
};
let secs;
const timeFromNow = async (ws, timestamp) => {
  let time_now = moment();
  let duration = moment.duration(time_now.diff(timestamp));
  secs = Math.round(-duration.asSeconds());

  return secs;
};

//Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.dbURI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.error("Connected to db"));
