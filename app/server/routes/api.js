"use strict";
const express = require("express");
const router = express.Router();
const times = require("./times");
const moment = require("moment-timezone");
// const serverTimer = require("./serverTimer");

// const posts = require("./posts");
// const comments = require("./comments");
// const events = require("./events");

router.use("/times", times);
// router.use("/posts", posts);
// router.use("/comments", comments);
// router.use("/events", events);

// Handle GET requests to /api route

// let time_end = true;
// while (time_end) {
// serverTimer();
//   setInterval(500);
// }

// console.log("end_time_db_1: ", end_time_db);
const timer = 60;

let end_time_db;
let end_time_db_json;
router.route("/").get((req, res) => {
  // function getTime() {
  end_time_db = moment().tz("America/New_York").format();
  end_time_db_json = { end_time_db };
  // }

  res.send({
    test: 1,
    message: end_time_db,
  });

  // setInterval(serverTimer, 1000);
  // console.log("getTime.end_time_db_2: ", getTime.end_time_db);
});
// console.log(serverTimer().end_time_db);

module.exports = router;
