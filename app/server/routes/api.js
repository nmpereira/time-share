"use strict";
const express = require("express");
const router = express.Router();
const times = require("./times");
const serverTimer = require("./serverTimer");

// const posts = require("./posts");
// const comments = require("./comments");
// const events = require("./events");

router.use("/times", times);
// router.use("/posts", posts);
// router.use("/comments", comments);
// router.use("/events", events);

// Handle GET requests to /api route

serverTimer();
// console.log("end_time_db_1: ", end_time_db);
const timer = 60;

router.route("/").get((req, res) => {
  res.json({
    message: getTime.end_time_db,
  });
  console.log("getTime.end_time_db_2: ", getTime.end_time_db);
});
// console.log(serverTimer().end_time_db);

module.exports = router;
