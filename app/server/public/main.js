// const moment = require("moment");
const date = new Date();
let date_string = date.toISOString();
document.getElementById("user").value = (Math.random() + 1)
  .toString(36)
  .substring(2);
document.getElementById("end_time").value = date_string;
