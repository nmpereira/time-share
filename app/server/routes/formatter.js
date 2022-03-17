const moment = require("moment");
// Handle GET requests to /api route
const formatter = (action, timestamp, run, userID) => {
  return { action, timestamp, run, time: moment().format() };
};
module.exports = formatter;
