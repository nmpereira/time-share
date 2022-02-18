"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();

const time = require("../models/time");

//Get single Time by id
router.route("/:id").get(getTime, async (req, res) => {
  try {
    res.json(res.time);
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
