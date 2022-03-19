"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const time = require("../models/time");
const moment = require("moment");
const sendMessage = require("../index.js");
const runATimer = require("../index.js");
const joinARoom = require("../index.js");
const helpers = require("./helpers");

//Get all Times
router.route("/").get(async (req, res) => {
  try {
    const times = await time.find();
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Get single Time by id
router.route("/:id").get(getTime, async (req, res) => {
  try {
    res.json(res.time);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Get single Time by id
router.get("/time/:id", async (req, res) => {
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

//Create times
router.route("/").post(async (req, res, next) => {
  const updated_at = Date.now();
  const Time = new time({
    user: req.body.user,
    num_work: req.body.num_work,
    time_work: req.body.time_work,
    num_break: req.body.num_break,
    time_break: req.body.time_break,
    sets: req.body.sets,
    end_time: req.body.end_time,
    paused: req.body.paused,
    updated_at,
  });

  if (!Time.user || !Time.sets || !Time.end_time) {
    return res.status(400).json({
      msg: "Please include a user, num_work,time_work, num_break,time_break, sets, end_time",
    });
  }

  try {
    const newTime = await Time.save();
    res.redirect(`/api/times/time/${newTime._id}`);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

//Update single Time by id
router.route("/:id").put(getTime, async (req, res) => {
  const query = { _id: req.params.id };
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
    res.send(times);
  } catch (err) {
    res.status(500).json({ msg1: err.message });
  }
});

//Delete single Time by id
router.route("/:id").delete(getTime, async (req, res) => {
  try {
    const removedTime = await res.time.remove();
    res.json({ message: "Deleted time" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

async function getTime(req, res, next) {
  let input;
  try {
    input = await time.findById(req.params.id);
    if (input == null) {
      return res.status(404).json({ message: "Cannot find time" });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }

  res.time = input;
  next();
}

module.exports = router;
