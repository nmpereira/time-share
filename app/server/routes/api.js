"use strict";
const express = require("express");
const router = express.Router();
const times = require("./times");
const moment = require("moment-timezone");
const serverTimers = require("./serverTimers");

router.use("/times", times);
router.use("/serverTimers", serverTimers);

let end_time_db;
let end_time_db_json;
router.route("/").get((req, res) => {
  end_time_db = moment().tz("America/New_York").format();
  end_time_db_json = { end_time_db };

  res.send({
    test: 1,
    message: end_time_db,
  });
});

module.exports = router;
