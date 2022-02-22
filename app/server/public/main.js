const date = new Date();
let date_zone = moment().tz("America/New_York").format();

document.getElementById("user").value = (Math.random() + 1)
  .toString(36)
  .substring(2);

const num_work = document.getElementById("num_work");
const time_work = document.getElementById("time_work");
const num_break = document.getElementById("num_break");
const time_break = document.getElementById("time_break");
const sets = document.getElementById("sets");

num_work.addEventListener("change", time_calc);
time_work.addEventListener("change", time_calc);
num_break.addEventListener("change", time_calc);
time_break.addEventListener("change", time_calc);
sets.addEventListener("change", time_calc);

function time_calc() {
  const num_work_value = num_work.value;
  const time_work_value = time_work.value;
  const num_break_value = num_break.value;
  const time_break_value = time_break.value;
  const sets_value = sets.value;

  let total_work_time = num_work_value * time_work_value;
  let total_break_time = num_break_value * time_break_value;
  let total_time_single = total_work_time + total_break_time;
  let total_time_all = total_time_single * sets_value;
  let add_seconds = total_time_all;
  let end_time_new = moment()
    .tz("America/New_York")
    .add(add_seconds, "seconds")
    .format();
  document.getElementById("end_time").value = end_time_new;
  document.getElementById("seconds_time").innerHTML = add_seconds;
}
time_calc;
let add_seconds = 20;

let span = document.getElementById("current_time");

function time() {
  var d = new Date();
  var s = d.getSeconds();
  var m = d.getMinutes();
  var h = d.getHours();
  span.innerHTML =
    ("0" + h).substr(-2) +
    ":" +
    ("0" + m).substr(-2) +
    ":" +
    ("0" + s).substr(-2);
}

setInterval(time, 1000);
setInterval(time_calc, 1000);
time;
