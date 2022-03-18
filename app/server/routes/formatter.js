const moment = require("moment");
// Handle GET requests to /api route
const formatter = (action, timestamp, expired, userID) => {
  return { action, timestamp, expired, time: moment().format() };
};
module.exports = formatter;
