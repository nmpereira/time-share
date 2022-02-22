const moment = require("moment");
// Handle GET requests to /api route
const logger = (req, res, next) => {
  console.log(
    `${req.method}: '${req.protocol}://${req.get("host")}${
      req.originalUrl
    }' at: '${moment().format()}'`
  );
  next();
};
module.exports = logger;
