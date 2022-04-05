// const moment = require("moment");
const moment = require("moment-timezone");
// Handle GET requests to /api route
const formatter = (action, timestamp, expired, isBreak, isUpdateTimer) => {
  return {
    action,
    timestamp,
    expired,
    isBreak,
    isUpdateTimer,
    time: moment().tz("America/New_York").format(),
  };
};
module.exports = formatter;
