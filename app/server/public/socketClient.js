// Create WebSocket connection.

var loc = window.location,
  new_uri;
if (loc.protocol === "https:") {
  new_uri = "wss:";
} else {
  new_uri = "ws:";
}
// console.log("1 ", new_uri);
new_uri += "//" + loc.host;
console.log("2 ", new_uri);
// new_uri += loc.pathname;
// console.log("3 ", new_uri);
// console.log(loc);
// console.log(loc.hostname);
// console.log(loc.port);

// var HOST = "wss://time-share.herokuapp.com";
// var HOST = "ws://localhost";
var HOST = new_uri;
console.log("HOST: ", HOST);
var ws = new WebSocket(HOST);

// Connection opened
ws.addEventListener("open", function (event) {
  console.log("Connected to WS Server");
});

// Listen for messages
ws.addEventListener("message", function (event) {
  console.log("Message from server ", event.data);
});
const user = document.getElementById("user");
const sendMessage = () => {
  ws.send(`Hello From: ${user.value}`);
};
