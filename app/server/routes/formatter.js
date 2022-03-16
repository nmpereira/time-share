const moment = require("moment");
// Handle GET requests to /api route
const formatter = (action, timestamp, userID) => {
  return { action, timestamp, time: moment().format() };
};
module.exports = formatter;
